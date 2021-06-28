// initializing session variables
var session_date = sessionStorage.getItem("date"); 
var session_previous_button = sessionStorage.getItem("previous-button-clicked"); 
var session_next_button = sessionStorage.getItem("next-button-clicked"); 

// if session_date is not undefined, one of three things has taken place: 
// - the user has clicked the previous button
// - the user has clicked the next button
// - the user has clicked the next button and, in doing so, tried to access the APOD for the current date (which doesn't exist)

if (session_date != null) { 
    if (session_previous_button) {
        var date = new Date(session_date);
        moveDateBackward(date); // uses the setDate() method to move the date back by 1 
        var timestamp = formatDate(date);
    } else if (session_next_button) {
        var date = new Date(session_date);
        moveDateForward(date); // uses the setDate() method to move the date forward by 1
        var timestamp = formatDate(date);
    } else {
        var date = new Date()
        var timestamp = formatDate(date); 
    }
} else {
    var date = new Date();
    var timestamp = formatDate(date); // will return the current date in "YYYY-MM-DD" format  
}

const api_key = ""; // currently empty. See bottom of README.md
const api_url = `https://api.nasa.gov/planetary/apod?api_key=${api_key}&date=${timestamp}`;

async function main() {
    var JsonData = await getJsonData(api_url); // the await keyword is exclusive to async functions...this is why main() is asynchronous

    insertPageContent(JsonData, timestamp); 

    // adding event listeners to the previous '<' and next '>' buttons
    // if the previous button is clicked, we want to make an API call for the previous date and update the page with this info
    // if the next button is clicked, we want to make an API call for the next date (if it exists) and update the page with this info
    document.getElementById("previous-button").addEventListener("click", () => {
        sessionStorage.setItem("date", date);
        sessionStorage.setItem("previous-button-clicked", true); 
        sessionStorage.removeItem("next-button-clicked"); 

        window.location.assign("index.html"); 
    }); 

    document.getElementById("next-button").addEventListener("click", () => {
        sessionStorage.setItem("date", date); 
        sessionStorage.setItem("next-button-clicked", true); 
        sessionStorage.removeItem("previous-button-clicked"); 

        window.location.assign("index.html"); 
    });
}

main(); 

function moveDateBackward(date) {
    date.setDate(date.getDate() - 1);
}

function moveDateForward(date) {
    date.setDate(date.getDate() + 1);
}

function insertPageContent(JsonData, timestamp) {
    // occasionally the APOD is a video. Luckily the API provides a media_type field which we can check to handle this problem
    checkMediaType(JsonData); 
    
    // inserting APOD date
    insertAPODdate(timestamp); 
    
    // inserting the APOD explanation into a <p> tag
    document.getElementById("explanation").textContent = JsonData.explanation;

    // inserting the APOD image title into a <h1> tag 
    document.getElementById("image-title").textContent = JsonData.title; 

}

function checkMediaType(JsonData) {
    if (JsonData.media_type == "image") {
        insert_image(JsonData); 
    } else if (JsonData.media_type == "video") {
        insert_video(JsonData);
    }
}

function insert_image(JsonData) {    
    var apod_image = document.getElementById("apod"); 
    var apod_video = document.getElementById("apod-video"); 

    // inserting the hdurl (image url) into the <img> tag "src" attribute
    apod_image.src = JsonData.hdurl; 

    // 'removing' the iframe tag which is present to display videos (which isn't necessary if media_type = "image")
    apod_video.style.display = "none"; 

}

function insert_video(JsonData) {
    var apod_image = document.getElementById("apod"); 
    var apod_video = document.getElementById("apod-video"); 
    
    // inserting the APOD video url into the <iframe> tag "src" attribute 
    apod_video.src = JsonData.url; 

    // 'removing' the image tag which is present to display images (which isn't necessary if media_type = "video")
    apod_image.style.display = "none"; 
}

function insertAPODdate(timestamp) {
    // inserting the APOD date into the <p> tag
    document.getElementById("apod-date").textContent = timestamp; 
}

async function getJsonData(api_url) {
    let response = await fetch(api_url); 
    let data = await response.json(); 
    
    // the Astronomy Picture of the Day API does not allow users to access the picture of the current date.
    // the fetch() will throw an error if the user tries to access a picture for the current date.
    // the code below handles that error by clearing session storage (essentially resetting date) and redirecting the user

    if (response.ok) {
        return data; 
    } else { 
        sessionStorage.clear(); 
        window.location.assign("index.html");
    }
}

// returns a date that is in YYYY-MM-DD format
function formatDate(date) {
    var year = date.getFullYear();
    // add 1 because getMonth() method will start enumerating months from zero (ie. January is month num 0)
    var month = (date.getMonth() + 1);
    var day = date.getDate();

    // we cannot access the APOD api for the current day, so we have to 'backtrack' to the previous day by subtracting 1

    if (day == 1) { // if it is the first day of the month, we want to set the date to the previous day (which will be in a different month, and possibly a different year (in the case that date is YYYY-01-01))
        dateFieldsArray = backtrackDate(year, month, day); // returns array in [year, month, day] structure
        year = dateFieldsArray[0].toString();
        month = dateFieldsArray[1].toString();
        day = dateFieldsArray[2].toString();  
    } else {
        year = year.toString(); 
        month = month.toString();
        day = (day - 1).toString(); 
    }

    // adds a zero in front of the date field if necessary (ie. for month = "6", correctDateField(month) would return month = "06")
    month = correctDateField(month);
    day = correctDateField(day);
    // there is no need to execute correctDateField(year) as the year will always be in "YYYY" format

    // now the year, month and day fields are joined together and seperated by hyphens
    var formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
}

// combats error caused by accessing API on the same day by 'backtracking' the date by one day
// it is designed to work even when the date being backtracked to is in a different year, month or even leap year
// returns an array of [year, month, day] 
function backtrackDate(year, month, day) {
    switch(month) {
        case 1:
            day = "31";
            month = "12";
            year = (year - 1).toString();
            break; 
        case 2:
            day = "31";
            month = "01";
            break; 
        case 3:
            // a leap year: 
            // must be evenly divisible by 4
            // if the year can also be evenly divided by 100, it is not a leap year unless...
            // the year is also evenly divisible by 400. Then it is a leap year
            if (year % 4 == 0) {
                if (year % 100 == 0 && year % 400 == 0) {
                    day = "29";
                } else if (year % 100 != 0) {
                    day = "29"; 
                } else {
                    day = "28"; 
                }
            } else {
                day = "28"; 
            }
            month = "02";
            break;  
        case 4:
            day = "31"; 
            month = "03"; 
            break; 
        case 5:
            day = "30"; 
            month = "04"; 
            break; 
        case 6:
            day = "31"; 
            month = "05"; 
            break; 
        case 7: 
            day = "30";
            month = "06"; 
            break; 
        case 8: 
            day = "31"; 
            month = "07"; 
            break; 
        case 9:
            day = "31";
            month = "08";
            break; 
        case 10: 
            day = "30"; 
            month = "09";
            break; 
        case 11: 
            day = "31"; 
            month = "10"; 
            break; 
        case 12:
            day = "30"; 
            month = "11"; 
            break; 
        default:
            console.log("There is something wrong with this switch statement"); 
    }

    var dateFields_array = [year, month, day];

    return dateFields_array; 
}

// 'corrects' a date field by adding a zero ("0") character to the front of it if it is only one character long
// for example, month = "6" would become month = "06"
function correctDateField(string) {
    var zero = "0";

    if (string.length == 1) {
        string = zero.concat(string);
    }

    return string
}
