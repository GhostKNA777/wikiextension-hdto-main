import { AnyNode, Cheerio, CheerioAPI } from "cheerio";
import { IMovieInfo, IMovieResult, MovieType } from "../types/types";

// Short informations of the movie.
export const setMovieData = ($: Cheerio<AnyNode>, baseUrl: string) => {
    const typeMedia = $.find('.film-detail > .film-info > span:nth-child(1)').text() === 'Movie' ? MovieType.MOVIE : MovieType.TVSERIES;
    const releaseDate = $.find('.film-detail > .film-info > span:nth-child(2)').text();
    const movieData: IMovieResult = {
        id: $.find('.film-mask').attr('href')?.slice(1)!,
        title: $.find('.film-detail > .film-name > a').attr('title')!,
        quality: $.find('.film-thumbnail > .badge-tag').text()!,
        url: `${baseUrl}${$.find('.film-detail > .film-name > a').attr('href')}`!,
        image: $.find('.film-thumbnail-img').attr('src'),
        releaseDate: isNaN(parseInt(releaseDate)) ? null : releaseDate,
        type: typeMedia,
        //duration: $.find('.film-detail > .fd-infor > .fdi-duration').text(), //Dont exist
        seasons: typeMedia == MovieType.TVSERIES ? parseInt($.find('.film-detail > .film-info > span:nth-child(3)').text().split(' / ')[0].split(' ')[1]) : null,
        lastEpisodes: typeMedia == MovieType.TVSERIES ? parseInt($.find('.film-detail > .film-info > span:nth-child(3)').text().split(' / ')[1].split(' ')[1]) : null,
    };

    return movieData;
}

export const isJson = (data: string): boolean => {
    try {
        JSON.parse(data);
    } catch (err) {
        return false;
    }

    return true;
}

// Detail information of the movie.
export const setMovieInfo = ($: CheerioAPI, movieInfo: IMovieInfo, baseUrl: string) => {
    //const coverImageRegex = new RegExp(/^background-image: url\((.*)\)/);
    //const cover = $('.slide-cover > a:nth-child(1)').text()!;
    //const match = cover.match(coverImageRegex)!;
    const recommendedArr: IMovieResult[] = [];

    movieInfo.title = $('.heading-xl').text();
    movieInfo.url = `${baseUrl}${$('.div-buttons > a:nth-child(1)').attr('href')}`;
    //movieInfo.cover = cover;
    movieInfo.image = $('.film-thumbnail-img').attr('src')!;
    movieInfo.description = $('.description').text();
    movieInfo.releaseDate = $('.others > .item:nth-child(6)').text().replace('Release', '').trim();
    movieInfo.type = movieInfo.id.split('/')[0] === 'movie' ? MovieType.MOVIE : MovieType.TVSERIES;
    movieInfo.country = {
        title: $('.others > .item:nth-child(4)').text().replace('Country', '').trim()!,
        url: $('.others > .item:nth-child(4) > .item-body > a').attr('href')?.slice(1)!,
    };
    movieInfo.genres = $('.others > .item:nth-child(2) > .item-body > a')
        .map((_, el) => $(el).attr('title')).get();
    movieInfo.productions = $('.others > .item:nth-child(7) > .item-body > a')
        .map((_, el) => $(el).attr('title')).get();
    movieInfo.casts = $('.others > .item:nth-child(1) > .item-body > a')
        .map((_, el) => $(el).attr('title')).get();
    //movieInfo.tags = $('.m_i-d-content > .elements > .row-line:nth-child(6) > .h-tag')
       // .map((_, el) => $(el).text()).get(); //Dont exist
    movieInfo.duration = $('.others > .item:nth-child(3) > .item-body > span').text();
    movieInfo.rating = parseFloat($('.others > .item:nth-child(5) > .item-body > span').text());
    movieInfo.quality = $('.is-thumbnail > .film-thumbnail > .badge-tag').text();

    $('.m_i-related > .film-related > .block_area > .block_area-content > .film_list-wrap > .flw-item').each((_, el) => {
        recommendedArr.push(setMovieData($(el), baseUrl));
    });
    movieInfo.recommended = recommendedArr;
}

export const getPairs = (scriptText: string) : any  => {
    const script = scriptText.toString();
    const startOfSwitch = script.lastIndexOf('switch');
    const endOfCases = script.indexOf('partKeyStartPosition');
    const switchBody = script.slice(startOfSwitch, endOfCases);
    const matches = switchBody.matchAll(/:[a-zA-Z0-9]+=([a-zA-Z0-9]+),[a-zA-Z0-9]+=([a-zA-Z0-9]+);/g);
    const nums = [];
    for (const match of matches) {
        const innerNumbers = [];
        for (const varMatch of [match[1], match[2]]) {
            const regex = new RegExp(`${varMatch}=0x([a-zA-Z0-9]+)`, 'g');
            const varMatches = [...script.matchAll(regex)];
            const lastMatch = varMatches[varMatches.length - 1];
            if (!lastMatch) return [];
            const number = parseInt(lastMatch[1], 16);
            innerNumbers.push(number);
        }
        nums.push([innerNumbers[0], innerNumbers[1]]);
    }
    return nums!;
}