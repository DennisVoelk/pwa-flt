import { EMOJI, WIN, ZERO_WIDTH_SPACE } from "../../shared/constants.js";
import { ISettings, Settings } from "../../shared/settings.service.js";
import { Utils } from "../../shared/utils.service.js";
import { BaseCe, IInitializedCe } from "../base.ce.js";

interface ITrackInfo {
  track: MediaStreamTrack | undefined;
  hasTorch: boolean;
}

export const enum State {
  Uninitialized,
  Initializing,
  Disabled,
  Off,
  On,
}

export const EMPTY_TRACK_INFO: ITrackInfo = {
  track: undefined,
  hasTorch: false,
};

export class TorchCe extends BaseCe {
  protected state: State = State.Uninitialized;
  protected trackInfoPromise: Promise<ITrackInfo> = Promise.resolve(
    EMPTY_TRACK_INFO
  );

  private readonly settings: ISettings = Settings.getInstance();
  private readonly utils: Utils = Utils.getInstance();
  
  //Prüfen, ob Flash vorhanden
  //Was ist ein Track?
  //Track active = torch on
  //Track inactive = torch off

  protected async getTrackInfo(renewIfNecessary = false): Promise<ITrackInfo> {
    let trackInfo = await this.trackInfoPromise;
    const noActiveTrack =
      !trackInfo.track || trackInfo.track.readyState === "ended";

    if (noActiveTrack) {
      if (renewIfNecessary) {
        this.trackInfoPromise = WIN.navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "environment" } }) //Wichtig für IOS
          .catch(() => undefined)
          .then((stream) => stream && stream.getVideoTracks().pop())
          .then(async (track) => ({
            hasTorch:
              !!track &&
              (await this.utils.waitAndCheck(
                100,
                25,
                () => !!track.getCapabilities().torch
              )), //Prüfen ob Flash vorhanden/ob Permissions gegeben wurden
            track,
          }));

        trackInfo = await this.trackInfoPromise;
      } else {
        trackInfo = EMPTY_TRACK_INFO;
      }
    }

    return trackInfo;
  }

  //Init
  protected async initialize(): Promise<IInitializedCe<this>> {
    const self = await super.initialize();

    const onClick = () => this.toggleTorch();

    //Torch toggle
    const updateState = (this.updateState = async (
      newState: State,
      extraMsg?: string
    ) => {
      this.state = newState;

      const { track } = await this.getTrackInfo();
      if (track) {
        track.applyConstraints({ advanced: [{ torch: on }] }); //Flash an machen
      }
    });

    try {
      const [, { track, hasTorch }] = await Promise.all([
        updateState(State.Initializing),
        this.getTrackInfo(true),
      ]);

      //Permissions abfragen
      if (!hasTorch) {
        const permissionState = (
          await WIN.navigator.permissions.query({ name: "camera" })
        ).state;
        const errorMessage =
          permissionState === "denied"
            ? "Access to camera denied. Please, give permission in browser settings."
            : permissionState === "prompt"
            ? "Access to camera not granted. Please, give permission when prompted."
            : `Unable to detect ${!track ? "camera" : "torch"} on your device.`;

        throw new Error(errorMessage);
      }

      const onVisibilityChange = () => this.onVisibilityChange();
      WIN.document.addEventListener("visibilitychange", onVisibilityChange);

      /*
      this.cleanUpFns.push(
          () => WIN.document.removeEventListener('visibilitychange', onVisibilityChange),
          () => this.stopTrack());
        */

      await updateState(State.On);
    } catch (err) {
      this.onError(err);
    }

    return self;
  }

  protected async toggleTorch(): Promise<void> {
    await this.updateState(
      this.state === State.Off ? State.On : State.Off
    ).catch((err) => this.onError(err));
  }

  protected async onError(err: Error): Promise<void> {
    super.onError(err);
    await this.stopTrack();
    await this.updateState(State.Disabled, err.message);
  }

  protected async onVisibilityChange(): Promise<void> {
    const { track } = await this.getTrackInfo(!WIN.document.hidden);
    if (!track) return;

    if (WIN.document.hidden) {
      if (this.state === State.Off) {
        track.stop();
      }
    } else if (this.state === State.On) {
      track.applyConstraints({ advanced: [{ torch: on }] });
    }
  }

  protected async updateState(
    newState: State,
    extraMsg?: string
  ): Promise<void> {
    return undefined;
  }

  //disable torch
  private async stopTrack(): Promise<void> {
    const { track } = await this.getTrackInfo();
    if (track) track.stop();
  }
}
