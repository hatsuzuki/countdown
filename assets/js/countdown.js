/**
 * countdown.js
 * by hatsuzuki (2020-08-02)
 * 
 * web app to display the number of days left between 2 specified dates
 * currently fixed at 2020-07-27 and 2021-04-29
 * 
 * frameworks used:
 * - moment.js (https://momentjs.com)
 * - moment-business-days by kalmecak (https://github.com/kalmecak/moment-business-days)
 * - bootstrap 4 (https://getbootstrap.com)
 * - jquery (https://jquery.com)
 */

// onload
$(document).ready(function()
{
    // fixed start and end dates
    var startDate = moment("2023-09-01");
    var endDate = moment("2024-04-30");

    // get current date
    var currDate = moment().startOf("day");

    // set currDate to startDate if currDate is before startDate
    if (currDate.isBefore(startDate))
    { currDate = startDate; }

    // function to change negative values to zero
    function zeroify(x) { return x > 0 ? x : 0; }

    // display today's date, week number, and days elapsed
    $("#currDate").html(currDate.format("YYYY-MM-DD (ddd)"));
    $("#currWeek").html(currDate.diff(startDate, "weeks") + 1);
    $("#daysElapsed").html(currDate.diff(startDate, "days") + 1);

    // set currDate to endDate if currDate is after endDate
    if (currDate.isAfter(endDate))
    {
        currDate = endDate;
        $("#currDate").html(endDate.format("YYYY-MM-DD (ddd)")); // fix current date at endDate
        $("#currWeek").html(endDate.diff(startDate, "weeks") + 1); // fix current week
        $("#daysElapsed").html(endDate.diff(startDate, "days") + 1); // fix current day elapsed
    }


    
    /* DAYS LEFT */

    // calculate number of days left
    var daysLeft = zeroify(endDate.diff(currDate, "days"));
    $("#daysLeft").html(daysLeft);

    // remove "s" from label if daysLeft == 1
    if (daysLeft == 1) { $("#daysLeft-label").html("calendar day left!"); }



    /* PROGRESS BAR */

    // we do not differentiate between % of calendar days left vs. % of working days left
    // because the difference is negligible
    // so we will just use % of calendar days left only

    // calculate progress in percentage
    var totalDaysLeft = endDate.diff(startDate, "days");
    progress = ((totalDaysLeft-daysLeft)/totalDaysLeft * 100).toFixed(1); // note that toFixed() converts into string
    
    // sanity check for zero / negative % if currDate is before startDate
    if (parseInt(progress) <= 0)
    { progress = "0"; }

    // update progress bar and label
    $("#progress").html(progress);
    $("#progressBar").css("width", progress + "%");

    // special case for 100% (i.e. currDate is equal to or after endDate)
    if (progress == "100.0")
    {
        progress = "100";
        $("#progress-label").html("🎉CONGRATULATIONS!🎉");
    }



    /* WORKING DAYS LEFT */

    // set locale
    moment.locale("en");

    // define public holidays between start and end date
    var holidays =  {
                        "2023-11-12": "🪔 Deepavali",
                        "2023-11-13": "🛕 Deepavali (observed)",
                        "2023-12-25": "🎄 Christmas Day",
                        "2024-01-01": "🗻 New Year's Day",
                        "2024-02-10": "🧧 Chinese New Year Day 1",
                        "2024-02-11": "🧨 Chinese New Year Day 2",
                        "2024-02-12": "🐉 Chinese New Year Day 2 (observed)",
                        "2024-03-29": "⛪ Good Friday",
                        "2024-04-10": "🕌 Hari Raya Puasa"
                    };

    // define holidays and working days for locale
    moment.updateLocale("en", { holidays: Object.keys(holidays), holidayFormat:"YYYY-MM-DD", workingWeekdays:[1,2,3,4,5] });

    // calculate number of working days left
    var workingDaysLeft = zeroify(endDate.businessDiff(currDate, true));
    $("#workingDaysLeft").html(workingDaysLeft);

    // remove "s" from label if workingDaysLeft == 1
    if (workingDaysLeft == 1) { $("#workingDaysLeft-label").html("working day left!"); }



    /* WEEKS LEFT */

    // calculate number of weeks left
    // 3rd argument in moment.diff() is true to return floating number, then Math.ceil() it
    // otherwise e.g. n. of weeks between a Tuesday and the following Friday will be = 1 instead of 2
    var weeksLeft = zeroify(Math.ceil(endDate.diff(currDate, "weeks", true)));
    $("#weeksLeft").html(weeksLeft);

    // remove "s" from label if weeksLeft == 1
    if (weeksLeft == 1) { $("#weeksLeft-label").html("week to go!"); }



    /* WEEKEND COUNTDOWN */

    // get the final Friday evening before endDate
    var finalFriday = moment(endDate).startOf("day").subtract(1, "week").isoWeekday(5).add(19, "hours");
    
    // function to update countdown to the next Friday 19:00:00 before finalFriday
    update = function()
    {
        // if today is after finalFriday, do nothing and hide everything
        if (moment().isSameOrAfter(finalFriday))
        {
            $("#weekTimer-row").addClass("d-none");
            $("#weekTimer").html("");
            $("#weekTimer-label").html("");
            return;
        }

        // else if current time is between Friday 19:00:00 and Sunday 22:00:00, return special text
        if ((moment().isoWeekday() == 5 && moment().hour() >= 19) ||
            (moment().isoWeekday() == 6) ||
            (moment().isoWeekday() == 7 && moment().hour() < 22))
        {
            $("#weekTimer").html("💃🕺💃🕺");
            $("#weekTimer-label").html("");
            return;
        }

        // else display countdown to next Friday 19:00:00
        
        // get the next instance of Friday 19:00:00 (i.e. current week's Friday if today is a weekday,
        // else next week's Friday)
        var nextFriday;
        if (moment().isoWeekday() <= 5)
        { nextFriday = moment().isoWeekday(5).startOf("day").add(19, "hours"); }
        else
        { nextFriday = moment().add(1, "week").isoWeekday(5).startOf("day").add(19, "hours"); }

        // function to pad number with leading zeroes until it is length n
        Number.prototype.pad = function(size)
        {
            var s = String(this);
            while (s.length < (size || 2)) {s = "0" + s;}
            return s;
        };

        // calculate number of seconds between current time and nextFriday
        // then convert into hours, minutes, and seconds
        var diffSec = nextFriday.diff(moment(), 'seconds'),
            hours = Math.floor(diffSec / 3600),
            diff = diffSec - hours * 3600,
            minutes = Math.floor(diff / 60),
            seconds = diff - minutes * 60;
        
        // update label
        $("#weekTimer").html(hours + "h " + minutes.pad(2) + "m " + seconds.pad(2) + "s");
        $("#weekTimer-label").html("until Friday evening");
    };
    
    // if today is after finalFriday, remove the entire card
    // else run the update function once every second
    // (logic is reversed to prevent flash of unstyled content
    // so in reality the card is actually hidden on load and shown if there is an upcoming public holiday)
    if (moment().isSameOrBefore(finalFriday))
    {
        update();
        setInterval(update, 1000);
        $("#weekTimer-row").removeClass("d-none");
    }



    /* NEXT PUBLIC HOLIDAY */

    // get list of dates from holidays
    var holidayDates = Object.keys(holidays);
    
    // get the next public holiday in holidayDates that is after currDate
    var nextHoliday = "";
    for (var i = 0; i < holidayDates.length; i++)
    {
        nextHoliday = holidayDates[i];
        if (moment(nextHoliday).isAfter(currDate))
        { break; }
    }

    // after the last public holiday before endDate has passed, remove the entire card
    // (logic is reversed to prevent flash of unstyled content
    // so in reality the card is actually hidden on load and shown if there is an upcoming public holiday)
    if (currDate.isBefore(moment(nextHoliday)) &&
        currDate.isBefore(endDate) &&
        moment(nextHoliday).isBefore(endDate))
    { $("#nextHoliday-row").removeClass("d-none"); }

    // calculate number of days to the next public holiday
    var nextHolidayDiff = zeroify(moment(nextHoliday).diff(currDate, "days"));
    $("#nextHoliday").html(nextHolidayDiff);

    // remove "s" from label if nextHolidayDiff == 1
    if (nextHolidayDiff == 1) { $("#nextHoliday-label").html("day to next public holiday"); }

    // get the name of the next holiday
    var nextHolidayName = holidays[nextHoliday];
    $("#nextHolidayName").html(nextHolidayName);

    // get the date of the next holiday
    $("#nextHolidayDate").html(moment(nextHoliday).format("YYYY-MM-DD (ddd)"));



    // おまけ
    $("#currWeek-parent").click(function()
    { if (currDate.isBefore(endDate)) { window.location = "kama.html"; } });

});
