import axios from 'axios';
import cryptoJs from 'crypto-js';
import { IVideoResult } from '../types/types';
import { isJson, getPairs } from '../utils';

class VidCloud {
    protected serverName = 'VidCloud';
    //private readonly host = 'https://dokicloud.one';
    private readonly host2 = 'https://rabbitstream.net';

    extract = async (videoUrl: URL, isAlternative: boolean = false): Promise<IVideoResult> => {
        const videoResult: IVideoResult = {
            sources: [],
            subtiles: [],
        }

        try {
            const id = videoUrl.href.split('/').pop()?.split('?')[0];
            const options = {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': videoUrl.href,
                },
            };
            const { data } = await axios.get(`${this.host2}/ajax/embed-4/getSources?id=${id}`, options);

            let sources = null;

             if (!isJson(data.sources)) {

                /*- branch: e1
                  script_url: https://megacloud.tv/js/player/m/prod/e1-player.min.js?v=1702269662
                  - branch: e6
                  script_url: https://rapid-cloud.co/js/player/prod/e6-player-v2.min.js
                  - branch: e4
                  script_url: https://rabbitstream.net/js/player/prod/e4-player.min.js
                */
                const fileUrl = 'https://rabbitstream.net/js/player/prod/e4-player.min.js';
                let { data: key }  = await axios.get(fileUrl);
                key = key;
                key = getPairs(key);
                const sourcesArray = data.sources.split('');
                let extractedKey = '';
                let currentIndex = 0;
                for (const index of key) {
                    let start = index[0] + currentIndex;
                    let end = start + index[1];
                    for (let i = start; i < end; i++) {
                        extractedKey += data.sources[i];
                        sourcesArray[i] = '';
                    }
                    currentIndex += index[1];
                }
                key = extractedKey;
                data.sources = sourcesArray.join('');

                sources = JSON.parse(cryptoJs.AES.decrypt(data.sources, key).toString(cryptoJs.enc.Utf8));


            }

            for (const source of sources) {
                const { data } = await axios.get(source.file, options);
                const videoUrls = data.split('\n').filter((line: string) => line.includes('.m3u8')) as string[];
                const videoQualities = data.split('\n').filter((line: string) => line.includes('RESOLUTION=')) as string[];

                videoQualities.map((item, i) => {
                    const quality = item.split(',')[2].split('x')[1];
                    const url = videoUrls[i];

                    videoResult.sources.push({
                        url: url,
                        quality: quality,
                        isM3U8: url.includes('.m3u8'),
                    });
                });
            }

            videoResult.subtiles = data.tracks.map((track: any) => {
                return {
                    url: track.file,
                    lang: track.label ?? 'Default',
                }
            });

            return videoResult;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }


}

export default VidCloud;