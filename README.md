# MoviesCrawler

I used Amazon Prime due to its accessibility without requiring a login. Conversely, Netflix necessitates a user account and password for accessing their API. The assertion in the document stating 'There is no platform login needed to extract the data' is applicable solely to Amazon's platform.

Utilizing the Crawl-E Framework, I encountered limitations due to its Cheerio base, particularly in its inability to handle infinite scrolling. For Amazon, where certain categories exceed 20 products, implementing infinite scrolling becomes impossible. However, I successfully addressed this challenge by adjusting parameters within the URL, particularly within the parent category where all subcategories and genres of movies and TV series were accessible.

# How to install project locally
## How to install packages

Please follow the steps provided in the following documentation *https://crawl-e.internationalshowtimes.com/#/quickstart?id=project-setup*

## How to run the application

Tun the following commands at root of the repository:

1. To launch the application -> npm run app