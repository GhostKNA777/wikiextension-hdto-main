import { MOVIES } from "../src";
import { IVideoResult } from "../src/types/types";

(async () => {
    const HDTO = new MOVIES.HDTO();
    const data = await HDTO.fetchMovieInfo('movie/watch-titanic-online-19586');
    console.log(JSON.stringify(data));
    //const server = await HDTO.fetchEpisodeServers(data.id, data.episodes[0].id);
    //console.log(JSON.stringify(server));
    const source = await HDTO.fetchEpisodeSources(data.id, data.episodes[0].id) as IVideoResult;
    console.log(JSON.stringify(source));
    //const search = await HDTO.search('last kingdom', 1);
    //console.log(JSON.stringify(search));
    //const data = await HDTO.fetchMovieInfo(search.results[1].id);
    //const source = await HDTO.fetchEpisodeSources(data.id, data.episodes[0].id) as IVideoResult;
    //console.log(JSON.stringify(source));
    //const source = await HDTO.fetchEpisodeSources(data.id, data.episodes[0].id) as IVideoResult;
    //console.log(JSON.stringify(source));
    //console.log("FINAL:"+JSON.stringify(source));
    
})();