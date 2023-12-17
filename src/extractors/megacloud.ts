import axios from 'axios';
import cryptoJs from 'crypto-js';
import { IVideoResult } from '../types/types';
import { isJson, getPairs } from '../utils';

class MegaCloud {
    protected serverName = 'MegaCloud'; //tambien UpCloud

    extract = async (videoUrl: URL, isAlternative: boolean = false): Promise<IVideoResult> => {
        const videoResult: IVideoResult = {
            sources: [],
            subtiles: [],
        }

        try {
            const embed_id = videoUrl.href.split('/').pop()?.split('?')[0];

            const encrypted_res = await axios.get(`https://megacloud.tv/embed-1/ajax/e-1/getSources?id=${embed_id}`, {
                headers: {
                    "Miru-Url": `https://megacloud.tv/embed-2/ajax/e-1/getSources?id=${embed_id}`,
                    "X-Requested-With": "XMLHttpRequest",
                    "Referer": `https://megacloud.tv/embed-2/e-1/${embed_id}?k=1`,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
                }
            });


            //console.log(encrypted_res.data);
            const encrypted_res_data = JSON.parse(JSON.stringify(encrypted_res.data));


            if (encrypted_res_data.encrypted) {
                const fileUrl = 'https://megacloud.tv/js/player/m/prod/e1-player.min.js?v=1702269662';
                const { data } = await axios.get(fileUrl);
                const pairs = getPairs(data);
                const sourcesArray = encrypted_res_data.sources.split('');
                let extractedKey = '';
                let currentIndex = 0;
                for (const index of pairs) {
                    let start = index[0] + currentIndex;
                    let end = start + index[1];
                    for (let i = start; i < end; i++) {
                        extractedKey += encrypted_res_data.sources[i];
                        sourcesArray[i] = '';
                    }
                    currentIndex += index[1];
                }
                let key = extractedKey;
                encrypted_res_data.sources = sourcesArray.join('');
                var decryptedVal = JSON.parse(cryptoJs.AES.decrypt(encrypted_res_data.sources, key).toString(cryptoJs.enc.Utf8));
            }
            else {
                decryptedVal = JSON.stringify(encrypted_res_data.sources[0])
            }

            for (const source of decryptedVal) {
                const { data } = await axios.get(source.file);

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

            videoResult.subtiles = encrypted_res_data.tracks.map((track: any) => {
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

export default MegaCloud;