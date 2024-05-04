const { DefaultContext, DefaultRequestMaker, DefaultLogger, JsonFileWriter } = require('crawl-e/v0.6.5')
const ResponseParser = require('./responseParser')

let context = new DefaultContext()
let logger = new DefaultLogger()
let requestMaker = new DefaultRequestMaker()
requestMaker.logger = logger

let responseParser = new ResponseParser()
responseParser.logger = logger

let outputWriter = new JsonFileWriter()
outputWriter.logger = logger

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let results = [];

requestMaker.get('https://www.amazon.de/gp/video/storefront', context, (err, res) => {
    if (err) {
        console.error(`Something went wrong: ${err}`)
    }
    console.log('Status', res.status, '🙂')

    // getting the 2 biggest categories movies andtv series
    responseParser.parseCollectionsList(res, context, async (err, collections) => {

        console.log(`found ${collections.length} collections`)

        for (let collection of collections) {
            let collectionUrl = collection.url;
            
            // getting the next page of categories where we have a scroll infinite and we extract the next page and  
            // modify it so we can skip the scroll infinite and to have everyhing on the same page check line 46
            requestMaker.get(collectionUrl, context, (err, res) => {
                if (err) {
                    console.error(`Something went wrong: ${err}`)
                }
                console.log('Status', res.status, '🙂')

                responseParser.parseSubCollectionsList(res, context, async (err, subcollections) => {

                    console.log(`found ${subcollections.length} subcollections`)

                    for (let subcollection of subcollections) {

                        let subcollectionUrl = subcollection.url.replace('ref=atv_hm_nxt_2', '').replace('pageSize=14', 'pageSize=999');

                        // get all the categories from the parent category from above
                        requestMaker.get(subcollectionUrl, context, (err, res) => {
                            if (err) {
                                console.error(`Something went wrong: ${err}`)
                            }
                            console.log('Status', res.status, '🙂')

                            responseParser.parseCategoriesList(res, context, async (err, categories) => {

                                console.log(`found ${categories.length} categories`)

                                for (let category of categories) {

                                    let categoryUrl = category.url;

                                    // get all video url's
                                    requestMaker.get(categoryUrl, context, (err, res) => {
                                        if (err) {
                                            console.error(`Something went wrong: ${err}`)
                                        }
                                        console.log('Status', res.status, '🙂')

                                        responseParser.parseVideoDetailList(res, context, async (err, videodetails) => {

                                            console.log(`found ${videodetails.length} videodetails`)

                                            for (let video of videodetails) {

                                                let videoUrl = video.url.replace(/ref.+/g, '');

                                                await delay(5000);

                                                // get all the data about the video 
                                                requestMaker.get(videoUrl, context, (err, res) => {
                                                    if (err) {
                                                        console.error(`Something went wrong: ${err}`)
                                                    }
                                                    console.log('Status', res.status, '🙂')

                                                    responseParser.parseVideoData(res, context, async (err, videoData) => {

                                                        if (videoData.length != 0) {
                                                            videoData[0].Url = videoUrl;
                                                            results.push(videoData);

                                                            outputWriter.saveFile(results, context, (err) => {
                                                                if (err) {
                                                                    console.error(`Oh noo, sth. wen't wrong: ${err}`)
                                                                    return
                                                                }
                                                                console.log('All Done', '👏')
                                                            })
                                                        }
                                                    })
                                                })
                                            }
                                        })
                                    })
                                }
                            })
                        })
                    }
                })
            })
        }
    })
})

