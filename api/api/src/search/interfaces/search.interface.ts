export interface SearchItemMusicalWork {
    readonly id: string;
    readonly ISWC: string;
    readonly originalTitle: string;
    readonly creators: MusicalWorkCreator[];
    readonly alternativeTitles: string[];
    readonly associatedPerformers: string[];
    readonly associatedIsrcs: string[];
    readonly image: string;
}
export interface MusicalWorkCreator {
    readonly name: string;
    readonly IPINameNumber: string;
    readonly role: string;
}

export interface SearchItemSoundRecording {
    readonly id: string;
    readonly ISRC: string;
    readonly mainArtist: string;
    readonly featuredArtists: string[];
    readonly title: string;
    readonly versionTitle: string;
    readonly duration: number;
    readonly yearOfRecording: number;
    readonly territoryOfRecording: string;
    readonly languageOfPerformance: string;
    readonly originalReleaseDate: string;
    readonly originalReleaseLabel: string;
    readonly creators: string[];
    readonly isVideo: boolean;
    readonly releases: SoundRecordingRelease[];
    readonly image: string;
}

export interface SoundRecordingRelease {
    readonly title: string;
    readonly artist: string;
    readonly ICPN: string;
    readonly numberOfTracks: number;
    readonly label: string;
    readonly duration: number;
    readonly isCompilation: boolean;
}
