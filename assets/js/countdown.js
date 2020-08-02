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
    var startDate = moment("2020-07-27");
    var endDate = moment("2021-04-29");

    // get current date
    var currDate = moment().startOf("day");

    // set currDate to startDate if currDate is before startDate
    if (currDate.isBefore(startDate))
    { currDate = startDate; }

    // function to change negative values to zero
    function zeroify(x) { return x > 0 ? x : 0; }

    // display today's date and week number
    $("#currDate").html(currDate.format("YYYY-MM-DD (ddd)"));
    $("#currWeek").html(currDate.diff(startDate, "weeks") + 1);

    // sanity check for negative week number if currDate is before startDate
    if (currDate.diff(startDate, "weeks") + 1 < 0)
    { $("#currWeek").html("0"); }

    // set currDate to endDate if currDate is after endDate
    if (currDate.isAfter(endDate))
    {
        currDate = endDate;
        $("#currDate").html(endDate.format("YYYY-MM-DD (ddd)")); // fix current date at endDate
        $("#currWeek").html(endDate.diff(startDate, "weeks") + 1); // fix current week
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

    // define public holidays between 2020-07-27 and 2020-04-29
    // exclude public holidays that fall on a Saturday because no off will be given
    var holidays =  {
                        "2020-07-31": "🕌 Hari Raya Haji",
                        "2020-08-09": "🇸🇬 National Day",
                        "2020-08-10": "🇸🇬 National Day (observed)",
                        // "2020-11-14": "🪔 Deepavali <small><em>(no off though)</em></small>",
                        "2020-12-25": "🎄 Christmas Day",
                        "2021-01-01": "🎆 New Year's Day",
                        "2021-02-12": "🧧 Chinese New Year Day 1",
                        // "2021-02-13": "🧨 Chinese New Year Day 2  <small><em>(no off though)</em></small>",
                        "2021-04-02": "⛪ Good Friday"
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
    if (currDate.isSameOrAfter(moment(nextHoliday)) == false)
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
