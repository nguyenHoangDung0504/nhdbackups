'use strict';

console.time('Build DatabaseOld Time');
class DatabaseOld {
    static log = true;
    static listTrack = [];
    static listCode = [];
    static listCv = [];
    static listTag = [];
    static listSeries = [];
    static displayListTrack = [];
    static displayListCv = [];
    static displayListTag = [];
    static displayListSeries = [];

    static addTrackToDatabase(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink = "") {
        [cvs, tags, series, images, audios] = [cvs, tags, series, images, audios].map(member => Utils.standardizedTrackArrData(member));
        [cvs, tags, series] = [cvs, tags, series].map(member => member.sort());
        
        otherLink = otherLink.split(',').filter(subStr => subStr).map(noteNLink => {
            noteNLink = noteNLink.trim();
            const [note, link] = noteNLink.split('::').map(item => item.trim());
            return new OtherLink(note, link);
        })

        const track = new Track(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink);
        DatabaseOld.listTrack.push(track);
        DatabaseOld.listCode.push(code);

        const listOfListToAddItem = [DatabaseOld.listCv, DatabaseOld.listTag, DatabaseOld.listSeries];
        const classToCreate = [Cv, Tag, Series];
        [cvs, tags, series].forEach((member, index) => {
            member.forEach(item => {
                const listToAddItem = listOfListToAddItem[index];
                if (!item) return;
                let indexOfItem = listToAddItem.findIndex(itemToFind => itemToFind.name == item);

                if (indexOfItem == -1) {
                    listToAddItem.push(new classToCreate[index](item, 1));
                } else {
                    listToAddItem[indexOfItem].quantity++;
                }
            });
        });
    }

    // Sort tracks functions
    static sortListTrackByRjCode(desc = false) {
        DatabaseOld.displayListTrack = [...DatabaseOld.listTrack].sort((a, b) => {
            return Number(b.rjCode.replace('RJ', '').replaceAll('?', '')) - Number(a.rjCode.replace('RJ', '').replaceAll('?', ''))
        });
        if (desc)
            DatabaseOld.displayListTrack.reverse();
    }
    static sortListTrackByCode(desc = false) {
        DatabaseOld.displayListTrack = [...DatabaseOld.listTrack].sort((a, b) => a.code - b.code);
        if (desc)
            DatabaseOld.displayListTrack.reverse();
    }
    static sortListTrackByUploadOrder(desc = false) {
        DatabaseOld.displayListTrack = [...DatabaseOld.listTrack];
        if (desc)
            DatabaseOld.displayListTrack.reverse();
    }

    //Sort categories functions
    static sortListCategoryByName(listName, desc = false) {
        switch (listName.toLowerCase()) {
            case 'cv':
                DatabaseOld.displayListCv = [...DatabaseOld.listCv].sort(Utils.byName);
                if (!desc) DatabaseOld.displayListCv.reverse();
                break;
            case 'tag':
                DatabaseOld.displayListTag = [...DatabaseOld.listTag].sort(Utils.byName);
                if (!desc) DatabaseOld.displayListTag.reverse();
                break;
            case 'series':
                DatabaseOld.displayListSeries = [...DatabaseOld.listSeries].sort(Utils.byName);
                if (!desc) DatabaseOld.displayListSeries.reverse();
                break;

            default:
                break;
        }
    }
    static sortListCategoryByQuantity(listName, desc = false) {
        switch (listName.toLowerCase()) {
            case 'cv':
                DatabaseOld.displayListCv = [...DatabaseOld.listCv].sort(Utils.byQuantity);
                if (desc) DatabaseOld.displayListCv.reverse();
                break;
            case 'tag':
                DatabaseOld.displayListTag = [...DatabaseOld.listTag].sort(Utils.byQuantity);
                if (desc) DatabaseOld.displayListTag.reverse();
                break;
            case 'series':
                DatabaseOld.displayListSeries = [...DatabaseOld.listSeries].sort(Utils.byQuantity);
                if (desc) DatabaseOld.displayListSeries.reverse();
                break;

            default:
                break;
        }
    }

    // Get data functions
    static getSingleCategory(type, keyword) {
        const lowerCaseKeyword = keyword.toLowerCase();
        let arrayToSearch, returnValue = '';

        if (type === 'cv') {
            arrayToSearch = [...DatabaseOld.listCv];
        } else if (type === 'tag') {
            arrayToSearch = [...DatabaseOld.listTag];
        } else if (type === 'series') {
            arrayToSearch = [...DatabaseOld.listSeries];
        } else {
            return '';
        }

        arrayToSearch.forEach(ele => {
            if (ele.name.toLowerCase() == lowerCaseKeyword)
                returnValue = ele;
        });

        return returnValue;
    }
    static getCategory(type, keyword) {
        const lowerCaseKeyword = keyword.toLowerCase();
        let arrayToSearch;

        if (type === 'cv') {
            arrayToSearch = [...DatabaseOld.listCv];
        } else if (type === 'tag') {
            arrayToSearch = [...DatabaseOld.listTag];
        } else if (type === 'series') {
            arrayToSearch = [...DatabaseOld.listSeries];
        } else {
            return [];
        }

        const returnValue = arrayToSearch.filter(item => item.name.toLowerCase().includes(lowerCaseKeyword));

        returnValue.sort((a, b) => {
            const indexA = a.name.toLowerCase().indexOf(lowerCaseKeyword);
            const indexB = b.name.toLowerCase().indexOf(lowerCaseKeyword);
            return indexA - indexB;
        });

        return returnValue;
    }
    static getSearchSuggestions(keyword) {
        const lowerCaseKeyword = keyword.toString().toLowerCase();
        const results = [];
        const seen = new Set();

        DatabaseOld.displayListTrack.forEach(track => {
            const lowerCaseCode = track.code.toString();
            const lowerCaseRjCode = track.rjCode.toLowerCase();
            const lowerCaseJapName = track.japName.toLowerCase();
            const lowerCaseEngName = track.engName.toLowerCase();

            // Check code
            if (lowerCaseCode.includes(lowerCaseKeyword) && !seen.has(`${track.code}_code`)) {
                results.push(new SearchResult("code", track.code, keyword, track.code));
                seen.add(`${track.code}_code`);
            }
            // Check rjCode
            if (lowerCaseRjCode.includes(lowerCaseKeyword) && !seen.has(`${track.rjCode}_rjCode`)) {
                results.push(new SearchResult("rjCode", track.rjCode, keyword, track.code));
                seen.add(`${track.rjCode}_rjCode`);
            }
            // Check cvs
            track.cvs.forEach(cv => {
                const lowerCaseCv = cv.toLowerCase();
                if (lowerCaseCv.includes(lowerCaseKeyword) && !seen.has(`${cv}_cv`)) {
                    results.push(new SearchResult("cv", cv, keyword, track.code));
                    seen.add(`${cv}_cv`);
                }
            });
            // Check tags
            track.tags.forEach(tag => {
                const lowerCaseTag = tag.toLowerCase();
                if (lowerCaseTag.includes(lowerCaseKeyword) && !seen.has(`${tag}_tag`)) {
                    results.push(new SearchResult("tag", tag, keyword, track.code));
                    seen.add(`${tag}_tag`);
                }
            });
            // Check series
            track.series.forEach(series => {
                const lowerCaseSeries = series.toLowerCase();
                if (lowerCaseSeries.includes(lowerCaseKeyword) && !seen.has(`${series}_series`)) {
                    results.push(new SearchResult("series", series, keyword, track.code));
                    seen.add(`${series}_series`);
                }
            });
            // Check english name
            if (lowerCaseEngName.includes(lowerCaseKeyword) && !seen.has(`${track.engName}_engName`)) {
                results.push(new SearchResult("engName", track.engName, keyword, track.code));
                seen.add(`${track.engName}_engName`);
            }
            // Check japanese name
            if (lowerCaseJapName.includes(lowerCaseKeyword) && !seen.has(`${track.japName}_japName`)) {
                results.push(new SearchResult("japName", track.japName, keyword, track.code));
                seen.add(`${track.japName}_japName`);
            }
        });

        const typeOrder = ["code", "rjCode", "cv", "tag", "series", "engName", "japName"];

        results.sort((a, b) => {
            const keywordIndexA = a.value.toString().toLowerCase().indexOf(lowerCaseKeyword);
            const keywordIndexB = b.value.toString().toLowerCase().indexOf(lowerCaseKeyword);
            if (keywordIndexA !== keywordIndexB) {
                return keywordIndexA - keywordIndexB;
            }
            const typeComparison = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
            if (typeComparison !== 0) {
                return typeComparison;
            }
            return a.value.toString().localeCompare(b.value.toString());
        });
        
        return results; 
    };
    static getTracksByKeyword(keyword) {
        const listTrack = DatabaseOld.displayListTrack;
        const lowerCaseKeyword = keyword.toString().toLowerCase();
        const results = [];

        // Find Tracks with code, name or rjCode containing keywords
        listTrack.forEach((track, index) => {
            const lowerCaseCode = track.code.toString();
            const lowerCaseRjCode = track.rjCode.toLowerCase();
            const lowerCaseJapName = track.japName.toLowerCase();
            const lowerCaseEngName = track.engName.toLowerCase();

            if (
                lowerCaseCode.includes(lowerCaseKeyword) ||
                lowerCaseRjCode.includes(lowerCaseKeyword) ||
                lowerCaseJapName.includes(lowerCaseKeyword) ||
                lowerCaseEngName.includes(lowerCaseKeyword)
            ) {
                results.push(index);
            }
        });

        // Find Tracks with CVs contain keywords
        listTrack.forEach((track, index) => {
            track.cvs.forEach((cv) => {
                const lowerCaseCv = cv.toLowerCase();
                if (lowerCaseCv.includes(lowerCaseKeyword) && !results.includes(index)) {
                    results.push(index);
                }
            });
        });

        // Find Tracks with tags containing keywords
        listTrack.forEach((track, index) => {
            track.tags.forEach((tag) => {
                const lowerCaseTag = tag.toLowerCase();
                if (lowerCaseTag.includes(lowerCaseKeyword) && !results.includes(index)) {
                    results.push(index);
                }
            });
        });

        // Find Tracks with series containing keywords
        listTrack.forEach((track, index) => {
            track.series.forEach((series) => {
                const lowerCaseSeries = series.toLowerCase();
                if (lowerCaseSeries.includes(lowerCaseKeyword) && !results.includes(index)) {
                    results.push(index);
                }
            });
        });

        return results.map((index) => listTrack[index]);
    };
    static getTracksByCategory(categoryType, keyword) {
        const listTrack = DatabaseOld.displayListTrack;
        const lowerCaseKeyword = keyword.toLowerCase();
        const tracks = [];
        const categoryTypes = ['cv', 'tag', 'series'];
        const categories = ['cvs', 'tags', 'series'];

        listTrack.forEach(track => {
            if (track[categories[categoryTypes.indexOf(categoryType)]].some(t => t.toLowerCase() === lowerCaseKeyword))
                tracks.push(track);
        });

        return tracks;
    }
    static getTracksByIdentify(identify) {
        let rs = '';

        DatabaseOld.listTrack.forEach(track => {
            if (track.code.toString() === identify || track.rjCode.toLowerCase() === identify.toLowerCase()) {
                rs = track;
            }
        });

        return rs;
    }
    static getTrackDataOfPage(page, trackPerPage) {
        const start = (page - 1) * trackPerPage;
        const end = Math.min(start + trackPerPage - 1, DatabaseOld.listCode.length);

        return DatabaseOld.displayListTrack.slice(start, end + 1);
    }
    static getRandomTracks(n) {
        const listTrack = DatabaseOld.listTrack;
        let shuffledIndexes = JSON.parse(localStorage.getItem('shuffledIndexes'));

        if (!shuffledIndexes || shuffledIndexes.length < n) {
            const remainingIndexes = Array.from(
                Array(!shuffledIndexes ? listTrack.length : listTrack.length - shuffledIndexes.length).keys()
            );
            Utils.shuffleArray(remainingIndexes);
            if (!shuffledIndexes) {
                shuffledIndexes = remainingIndexes;
            } else {
                shuffledIndexes.push(...remainingIndexes);
            }
            localStorage.setItem('shuffledIndexes', JSON.stringify(shuffledIndexes));
        }

        const randomTracks = [];
        for (let i = 0; i < n; i++) {
            const trackIndex = shuffledIndexes[i];
            const track = listTrack[trackIndex];
            randomTracks.push(track);
        }

        shuffledIndexes = shuffledIndexes.slice(n);
        localStorage.setItem('shuffledIndexes', JSON.stringify(shuffledIndexes));

        return randomTracks;
    }

    // Call when completed add data
    static buildData() {
        DatabaseOld.sortListTrackByRjCode();
        DatabaseOld.displayListCv = DatabaseOld.listCv.sort(Utils.byName);
        DatabaseOld.displayListTag = DatabaseOld.listTag.sort(Utils.byName);
        DatabaseOld.displayListSeries = DatabaseOld.listSeries.sort(Utils.byName);

        console.timeEnd('Build DatabaseOld Time');
        console.log(`Added: ${DatabaseOld.listCode.length} Tracks`);
        const listNames = ['List Track', 'List Cv', 'List Tag', 'List Series'];
        [DatabaseOld.displayListTrack, DatabaseOld.displayListCv, DatabaseOld.displayListTag, DatabaseOld.displayListSeries].forEach((list, index) => {
            if(!DatabaseOld.log) return;
            console.log(`Complete Build ${listNames[index]}:`, list);
        });
        DatabaseOld.testingFunctions();
    }
    static testingFunctions() {
        if(!DatabaseOld.log) return;
        console.log('\n\n\n\n\n');
        console.time('DatabaseOld functions testing time');
        console.log('Testing functions-----------------------------------------------------------------------');
        console.log( 'Get category "cv" with keyword "" (Get all CVs):', DatabaseOld.getCategory('cv', '') );
        console.log( 'Get category "tag" with keyword "" (Get all Tags):', DatabaseOld.getCategory('tag', '') );
        console.log( 'Get category "series" with keyword "" (Get all Series):', DatabaseOld.getCategory('series', '') );
        console.log( 'Get search suggestions with keyword "Na"', DatabaseOld.getSearchSuggestions('Na') );
        console.log( 'Get all tracks by keyword "saka"', DatabaseOld.getTracksByKeyword('saka') );
        console.log( 'Get tracks by category "cv" with keyword "narumi aisaka"', DatabaseOld.getTracksByCategory('cv', 'narumi aisaka') );
        console.log( 'Get tracks by category "tag" with keyword "elf"', DatabaseOld.getTracksByCategory('tag', 'elf') );
        console.log( 'Get tracks by category "series" with keyword "ドスケベjKシリーズ"', DatabaseOld.getTracksByCategory('series', 'ドスケベjKシリーズ') );
        console.log( 'Get tracks by identify with code "107613"', DatabaseOld.getTracksByIdentify('107613') );
        console.log( 'Get tracks by identify with RJcode "Rj377038"', DatabaseOld.getTracksByIdentify('Rj377038') );
        console.log( 'Get random 10 tracks', DatabaseOld.getRandomTracks(10) );
        console.log( 'Get random 20 tracks', DatabaseOld.getRandomTracks(20) );
        console.log('End testing functions------------------------------------------------------------------');
        console.timeEnd('DatabaseOld functions testing time');
        console.log('\n\n\n\n\n');
    }
}
function addTrack(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink) {
    DatabaseOld.addTrackToDatabase(code, rjCode, cvs, tags, series, engName, japName, thumbnail, images, audios, otherLink);
}
