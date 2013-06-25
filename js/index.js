(function () {

    if (navigator.userAgent.match(/(iPad|iPhone|Android)/)) {
        // This is running on a device so waiting for deviceready event
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        // Polyfill for navigator.notification features to work in browser when debugging
        navigator.notification = {
            alert: function (message) {
                // Using standard alert
                alert(message);
            }
        };
        // On desktop don't have to wait for anything
        onDeviceReady();
    }

    function onDeviceReady() {

        // Initializing Parse API's
        Parse.initialize('DeE1IIk6SSWxDVAiywycW78jUBA4ZXXT1nZrFfoV', 'QsKQMMV9tQLMiO9GfSh305qP6cy3gqfqCTSQyFEP');

        // Getting user coords using HTML5 geo API
        getCoords();

    }

    function getCoords() {

        // Using GeoLocation API
        navigator.geolocation.getCurrentPosition(function (position) {
            // Recursive call with coords this time
            findUsersNearby(position.coords);
        }, function (error) {
            // Something went wrong, showing alert box
            navigator.notification.alert('Could\'t obtain your location please try again!', null, 'Error');
        }, {
            maximumAge: 3000,
            timeout: 5000,
            enableHighAccuracy: true
        });

    }

    function findUsersNearby(coords) {

        // Defining UserLocation type
        var UserLocation = Parse.Object.extend('UserLocation');

        // Creating a Parse query
        var locQuery = new Parse.Query(UserLocation);

        // Searching for checkedin users in 100 meters distance
        locQuery.withinKilometers('coords',
            new Parse.GeoPoint({
            latitude: coords.latitude,
            longitude: coords.longitude
        }),
            0.1 // 100 meters range
        );

        // Returning results array should include referenced User object
        locQuery.include("user");

        // Results should be sorted descending by createdAt date
        locQuery.descending("createdAt");

        // Execute the query
        locQuery.find({
            success: function (results) {

                // Iterate through the results
                var items = [];
                results.forEach(function (userLocation) {

                    var user = userLocation.get('user');

                    if (user) {
                        // Creating new list item
                        var item = _.template($('#user-list-item').html(), {
                            user: user,
                            userLocation: userLocation
                        });

                        items.push(item);
                    }

                });

                $('.topcoat-list').html(items);

            },
            error: function (error) {
                navigator.notification.alert('error ' + error.message + ' code: ' + error.code, null, 'Error');
            }
        });

    }

})();