# Astronomy Picture of the Day Application

This document is an outline of my Astronomy Picture of the Day application. 

## Description

This project serves as an exercise for learning how to use application programming interfaces (APIs) within Javascript. On the clientside, `fetch()` is used to retrieve data from the Astronomy Picture of the Day (APOD) API; an API which is openly available from the [NASA website](https://api.nasa.gov/). This retrieved data is then presented on a webpage. Additionally, there are buttons available to the user which can be used to navigate between APOD submissions. 

## How the APOD API works

Each day, the APOD API updates with a new astronomy picture (or sometimes video) and accompanying explanation. Developers can interact with this data by presenting an HTTP request. The request used in this project is as follows: 

`GET https://api.nasa.gov/planetary/apod?api_key=api_key&date=timestamp`

This request will return all the data for a specific date including the image title, explanation, url and media type (image or video). The request must include an API key which can be generated on NASA's website. The date parameter must be in 'YYYY-MM-DD' format. Note that the APOD API does not allow the retrieval of data for the current date.

If you want to find out more about the APOD API, [click here](https://api.nasa.gov/) and browse APIs until you find 'APOD'. 

## Project Installation

This program is only intended for local deployment. If you want to get this application up and running on your own device, do the following:

1. Download and unzip the ZIP file (which can be downloaded from Github)

2. Visit the [NASA website](https://api.nasa.gov/) and follow the steps to generate an API key

3. Within the scripts folder of the project, create a javascript file called apiKey.js. In apiKey.js, write: `var apiKey = your_API_key`

4. Run index.html in a browser of your choice


## Challenges I faced during development   
### 1: Implementing APOD navigation

Early in the project, I decided to implement a feature that allows users to navigate between astronomy picture of the days with previous ('<') and next ('>') buttons. This feature operates by refreshing the page and changing the 'date' field of the API call every time the user presses a navigation button. The relevant data from this API call is then displayed on the page. The 'date' field for the API call is dependent on which button is clicked. If the 'previous' button is clicked, the API call's 'date' field will be equal to the date of the preceding day. If the 'next' button is clicked, the 'date' field will be equal to the date of the following day (if it exists).

For this feature, displaying data from the 'button-triggered' API call on the page proved to be more difficult than I originally anticipated. My first attempt aimed to take the 'old' API-data from my html containers, and replace it with data from the new API call without page refresh. This attempt was unsuccessful as it relied on my incorrect assumption that the html containers would automatically be filled with the new data once the API call had been made. I quickly realized that if I wanted my html containers to be refilled with new data, I would need to refresh the page. I would also need to start thinking about it as being one API call modified upon page refresh as opposed to two entirely different API calls (one for page load and one for button click). This presented a new problem: how would I prevent the date variable from being cleared when the page refreshed? The date variable needs to be saved when the user clicks a navigation button and the page is refreshed. If it is cleared, then the APOD data displayed when the page is refreshed will always be for the current date (which is not what we want if the user has clicked the 'previous' or 'next' button). It turns out that the solution to this problem is to use session variables.

The following block of Javascript code is ran everytime the page is loaded/refreshed: 

![javascript_code ](https://user-images.githubusercontent.com/85216187/123647070-1e840180-d86b-11eb-9f7c-1d72cf0b6dcc.jpg)

If the page is being loaded for the first time, the current date will be assigned to the API call. If the page is not being loaded for the first time, then the date value which is stored in the session will be moved either forwards or backwards (depending on which button has been clicked) and then assigned to the API call.

### 2: Hiding the API key

Hiding the API key is a necessary step in all projects. If someone gains control of your API key they could exceed rate limits, violate an APIs terms of service and abuse your access to a resource. Usually, we would store an API key in a .env file and then access it externally by referring to the .env file. This is commonly done in Node.js by using the [dotenv package](https://www.npmjs.com/package/dotenv). However, accessing an API key hidden away in a .env file is very difficult without a backend. This is because many of the functions required to complete the task are not natively supported in the web browser (ie. `require` is specific to Node.js). Unfortunately, the fact that my APOD application lacks a backend means that it is very difficult to hide API keys using environment variables. Luckily, this application is intended only for local deployment. This means that I can hide my API key by storing it in a separate javascript file (apiKey.js) and then inserting this into my html above the main script file (sketch.js). 
