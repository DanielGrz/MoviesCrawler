const { BaseHtmlParser, ValueGrabber } = require('crawl-e/v0.6.5')

class ResponseParser extends BaseHtmlParser {
    constructor() {
        super()

        this.postTitleGrabber = new ValueGrabber((box, context) => {

            let titleTag = box.find('h1[data-automation-id="title"]') ? box.find('h1[data-automation-id="title"]').text() : box.find('h1 > div > img').attr('alt')
            return {
                name: titleTag
            }
        })

        this.postTypeGrabber = new ValueGrabber((box, context) => {

            let typeTag = box.find('span[aria-label*="episodes"]')
            let type = typeTag ? "Series" : "Movie"
            return {
                videoType: type
            }
        })

        this.postDescriptionGrabber = new ValueGrabber((box, context) => {

            let descriptionTag = box.find('span.fbl-expandable-text')
            return {
                description: descriptionTag.text()
            }
        })

        this.postAgeGrabber = new ValueGrabber((box, context) => {

            let ageTag = box.find('span.fbl-maturity-rating')
            return {
                age: ageTag.text()
            }
        })

        this.postUrlGrabber = new ValueGrabber({
            attribute: 'href',
        })
    }

    parseCollectionsList(response, context, callback) {
        let { container, parsingContext } = this.prepareHtmlParsing(response.text, context)
        this.parseList(
            container,
            parsingContext,
            'collections',
            { box: 'li[data-automation-id="nav-pv-nav-home-drop-down"] li > a[href*="movie"],li[data-automation-id="nav-pv-nav-home-drop-down"] li > a[href*="contentType=tv"]' },
            (box, context, cb) => {
                cb(null, this.parseCollectionBox(box, context))
            },
            callback
        )
    }

    parseSubCollectionsList(response, context, callback) {
        let { container, parsingContext } = this.prepareHtmlParsing(response.text, context)
        this.parseList(
            container,
            parsingContext,
            'subcollections',
            { box: 'a[data-testid="page-pagination-button"]' },
            (box, context, cb) => {
                cb(null, this.parseCollectionBox(box, context))
            },
            callback
        )
    }

    parseCategoriesList(response, context, callback) {
        let { container, parsingContext } = this.prepareHtmlParsing(response.text, context)
        this.parseList(
            container,
            parsingContext,
            'categories',
            { box: 'a[href^="/gp/video/browse/"][data-testid="see-more"]' },
            (box, context, cb) => {
                cb(null, this.parseCollectionBox(box, context))
            },
            callback
        )
    }

    parseVideoDetailList(response, context, callback) {
        let { container, parsingContext } = this.prepareHtmlParsing(response.text, context)
        this.parseList(
            container,
            parsingContext,
            'videodetails',
            { box: 'a[href^="/gp/video/detail/"]' },
            (box, context, cb) => {
                cb(null, this.parseCollectionBox(box, context))
            },
            callback
        )
    }

    parseVideoData(response, context, callback) {
        let { container, parsingContext } = this.prepareHtmlParsing(response.text, context)
        this.parseList(
            container,
            parsingContext,
            'videoData',
            { box: 'div.av-detail-section-default' },
            (box, context, cb) => {
                cb(null, this.parseVideoDataBox(box, context))
            },
            callback
        )
    }

    parseCollectionBox(box, context) {
        return {
            url: `https://www.amazon.de${this.postUrlGrabber.grabFirst(box, context)}`,
        }
    }

    parseVideoDataBox(box, context) {
        return {
            Title: this.postTitleGrabber.grabFirst(box, context),
            Type: this.postTypeGrabber.grabFirst(box, context),
            Description: this.postDescriptionGrabber.grabFirst(box, context),
            "Age rating": this.postAgeGrabber.grabFirst(box, context),
        }
    }
}

module.exports = ResponseParser