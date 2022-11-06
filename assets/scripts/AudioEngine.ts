import { _decorator, AudioSource, assert, clamp01, AudioClip } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('AudioEngine')
export class AudioEngine {

    private static _instance: AudioEngine;
    private static _audioSource?: AudioSource;
    private gameVolume = 1;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new AudioEngine();
        return this._instance;
    }

    init(audioSource: AudioSource) {
        AudioEngine._audioSource = audioSource;
    }

    /**
   * Play music
   * @param {Boolean} loop Whether to loop
   */
    playMusic(loop: boolean) {
        const audioSource = AudioEngine._audioSource!
        assert(audioSource, 'AudioEngine not inited!');

        audioSource.loop = loop;
        if (!audioSource.playing) {
            audioSource.play();
        }
    }

    /**
    * Play a sound effect
    * @param {String} name The name of the sound effect
    * @param {Number} volumeScale Playback volume multiplier
    */
    playSound(audioClip: AudioClip, volumeScale: number = 1) {
        if (this.gameVolume == 1) {
            const audioSource = AudioEngine._audioSource!
            assert(audioSource, 'AudioEngine not inited!');

            audioSource.playOneShot(audioClip, volumeScale);
        }

    }

    muteSound(bool: boolean) {
        this.gameVolume = bool ? 0 : 1;
    }

    // Set the music volume
    setMusicVolume(flag: number) {
        const audioSource = AudioEngine._audioSource!
        assert(audioSource, 'AudioEngine not inited!');

        flag = clamp01(flag);
        audioSource.volume = flag;
    }

}