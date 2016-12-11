/**
 * Created by Rizwanyo on 12/9/2016.
 */
/*global $, moment*/
'use strict';

var Main = Main || {};

Main = function () {
    var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
        'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
        'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
        'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
        'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
        'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
        'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
        'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];
    var substringMatcher = function (strs) {
        return function findMatches(q, cb) {
            var matches, substrRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function (i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };

    var autocomplete = function () {
        $('#main-search').typeahead({
            hint: true,
            highlight: true,
            minLength: 1,
        }, {
            name: 'states',
            source: substringMatcher(states),
        }).bind('typeahead:select', function (ev, state) {
            searchState(state);
        }).on('keyup', function (e) {
            if (e.keyCode == '13') {
                searchState($(e.target).val());
            }
        });
    };

    var searchState = function (state) {
        $.ajax({
            url: 'http://maps.googleapis.com/maps/api/geocode/json?sensor=false&address=' + state,
            type: 'GET',
            success: function (data) {
                displaySearch(data);
            },
        });
    };

    var displaySearch = function (data) {
        moment().locale('sv');

        var stateData = [],
            date = moment().format('YYYY-MM-DD HH:mm'),
            searchContainer = $('.search-results');

        if ($('ul', searchContainer).length === 0) {
            searchContainer.append('<ul></ul>');
        }

        if (data.results.length === 0) {
            showError(date, searchContainer);
            return;
        }

        data = data.results[0].address_components;

        for (var i = 0; i < data.length; i++) {
            var type = data[i].types[0],
                name = data[i].long_name;

            if (type == 'political') {
                stateData.sublocality = name;
            } else if (type == 'locality') {
                stateData.locality = name;
            } else if (type == 'administrative_area_level_1') {
                stateData.state = name;
            } else if (type == 'country') {
                stateData.country = name;
                stateData.countryShortName = data[i].short_name;
            }
        }

        if (stateData.countryShortName != 'US') {
            showError(date, searchContainer);
            return;
        }

        var item = '<li class="item">' +
            '<div class="location">' +
            '<div class="state">' + stateData.state + '</div>' +
            '</div>' +
            '<div class="date">' + date + '</div>' +
            '<a href="#" class="remove"></a>' +
            '</li>';

        $('ul', searchContainer).prepend(item);

        removeItem();
        clearInput();
    };

    var showError = function (date, container) {
        var item = '<li class="item">' +
            '<div class="location">' +
            '<div class="sub-info">Wrong State, please try again</div>' +
            '</div>' +
            '<div class="date">' + date + '</div>' +
            '<a href="#" class="remove"></a>' +
            '</li>';

        $('ul', container).prepend(item);
    };

    var clearInput = function () {
        $('#main-search').val('');
    };

    var removeItem = function () {
        $('.search-results .remove').on('click', function (e) {
            e.preventDefault();

            $(e.target).parents('.item').remove();

            if ($('.search-results .item').length === 0) {
                $('.search-results ul').remove();
            }
        });
    };

    return {
        init: function () {

            autocomplete();

        },
    };
}();

$(document).ready(Main.init);
