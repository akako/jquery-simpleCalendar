/**
 * @author Akihito Kako <akakopublic@gmail.com>
 * @license MIT License
 * @version 1.0.3
 */
"use strict";
(function($) {
    var getItems = function(year, month, firstDayOfTheWeek) {
        var dates = [];
        var currentMonthStart = new Date(year, month - 1, 1);
        var currentMonthEnd = new Date(year, month, 0);
        var start = 1 + firstDayOfTheWeek - currentMonthStart.getDay();
        var date = new Date(year, month - 1, start);
        var end = new Date(year, month - 1, currentMonthEnd.getDate() + (6 + firstDayOfTheWeek - currentMonthEnd.getDay()));
        for (var i = start + 1; date <= end; i++) {
            dates.push({
                date: date,
                active: currentMonthStart <= date && date <= currentMonthEnd
            });
            date = new Date(year, month - 1, i);
        }
        return dates;
    };
    $.fn.simpleCalendar = function(options) {
        var parent = $(this);
        var today = new Date();
        var defaultOptions = {
            year: today.getFullYear(),
            month: today.getMonth() + 1,
            headers: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
            tableClass: 'simpleCalendar',
            cellClass: {},
            firstDayOfTheWeek: 0,
            previousClick: undefined,
            nextClick: undefined,
            cellClick: undefined,
            previousMonthLimit: undefined,
            nextMonthLimit: undefined,
            currentMonthFormatter: function(date) {return date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2);},
            previousMonthFormatter: function(date) {return '< ' + ('0' + (date.getMonth() + 1)).slice(-2);},
            nextMonthFormatter: function(date) {return ('0' + (date.getMonth() + 1)).slice(-2) + ' >';}
        };
        if (typeof(options) !== 'object') {
            options = defaultOptions;
        } else {
            for (var key in defaultOptions) {
                if (undefined === options[key]) {
                    options[key] = defaultOptions[key];
                }
            }
        }
        var formatterDate = new Date(options.year, options.month - 1, 1);
        options.year = formatterDate.getFullYear();
        options.month = formatterDate.getMonth() + 1;

        parent.empty();
        var table = $('<table />').addClass(options.tableClass).appendTo($(this));
        var controllerRow = $('<tr />').appendTo(table);
        var controllerTd = $('<td />').attr('colspan', 7).appendTo(controllerRow);
        var controllerCell = $('<div />').addClass('controller').appendTo(controllerTd);
        if (options.previousMonthLimit === undefined || options.previousMonthLimit > 0) {
            $('<div />').addClass('prev').append(options.previousMonthFormatter(new Date(options.year, options.month - 2, 1))).bind('click', function(){
                options.month--;
                options.year += Math.floor((options.month + 12) / 12) - 1;
                options.month = options.month % 12;
                if (options.previousMonthLimit !== undefined) options.previousMonthLimit--;
                if (options.nextMonthLimit !== undefined) options.nextMonthLimit++;
                if (typeof(options.previousClick) === 'function') {
                    var newOptions = options.previousClick(options);
                    if (newOptions === false) {
                        return;
                    } else if(typeof(newOptions) === 'object') {
                        options = newOptions;
                    }
                }
                parent.simpleCalendar(options);
            }).appendTo(controllerCell);
        }
        if (options.nextMonthLimit === undefined || options.nextMonthLimit > 0) {
            $('<div />').addClass('next').append(options.nextMonthFormatter(new Date(options.year, options.month, 1))).bind('click', function() {
                options.month++;
                options.year += Math.floor((options.month + 12) / 12) - 1;
                options.month = options.month % 12;
                if (options.previousMonthLimit !== undefined) options.previousMonthLimit++;
                if (options.nextMonthLimit !== undefined) options.nextMonthLimit--;
                if (typeof(options.nextClick) === 'function') {
                    var newOptions = options.nextClick(options);
                    if (newOptions === false) {
                        return;
                    } else if(typeof(newOptions) === 'object') {
                        options = newOptions;
                    }
                }
                parent.simpleCalendar(options);
            }).appendTo(controllerCell);
        }
        $('<div />').addClass('current').append(options.currentMonthFormatter(new Date(options.year, options.month - 1, 1))).appendTo(controllerCell);
        var headerRow = $('<tr />').appendTo(table);
        for (var i = 0; i < options.headers.length; i++) {
            $('<th />').append(options.headers[(i + options.firstDayOfTheWeek) % options.headers.length]).appendTo(headerRow);
        }

        var items = getItems(options.year, options.month, options.firstDayOfTheWeek);
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.date.getDay() === options.firstDayOfTheWeek) {
                var row = $('<tr />').appendTo(table);
            }
            var cell = $('<td />').append(item.date.getDate()).addClass(item.active ? 'active' : 'inactive').appendTo(row);
            if (item.active) {
                if (item.date.getDay() === 0) {
                    cell.addClass('sunday');
                } else if (item.date.getDay() === 6) {
                    cell.addClass('saturday');
                }
                if (item.date.getFullYear() === today.getFullYear() && item.date.getMonth() === today.getMonth() && item.date.getDate() === today.getDate()) {
                    cell.addClass('today');
                }
                if (typeof(options.cellClick) === 'function') {
                    cell.bind('click', {
                        date: item.date
                    }, options.cellClick);
                }
                for (var className in options.cellClass) {
                    var classTargetDates = options.cellClass[className];
                    for (var j = 0; j < classTargetDates.length; j++) {
                        if (classTargetDates[j].toString() === item.date.toString()) {
                            cell.addClass(className);
                        }
                    }
                }
            }
        }
    };
})(jQuery);