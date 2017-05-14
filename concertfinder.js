$(document).ready(function() {

$('.loading, .pagecover').addClass('hidden');

// Eventful API key: MzLD23LcPvTfgnrw
//JamBase SEARCH AND API FUNCTIONS

//JamBase Api url and key
// var jamBaseApi = {
// 	jamBaseArtistUrl: 'http://api.jambase.com/artists',
// 	jamBaseEventUrl: 'http://api.jambase.com/events',
// 	jamBaseApiKey: 'dmuv2jdmqbcad4yhdwshehf5',
// };

var eventfulApi = {
	eventfulUrl: 'http://eventful.com/events/',
	eventfulApiKey: 'MzLD23LcPvTfgnrw',
};

//Event listener for displaying events of searched artist
$('#js-search-form').submit(function(event) {
	event.preventDefault();
	$(this).find('#noresults').remove();
	$('#eventlist').html("<h1 class='loading'>Loading...</h1>")
	$('.artistname').text("");
	$('.artistname').text($('#js-artist').val());
	var correctedName = $('#js-artist').val().toString();
	console.log(correctedName);
	getArtistName(eventfulApi, correctedName);
})

//function for obtaining artistID from search
function getArtistName(eventfulApi, name) {
	let artistId;
	$('#js-search-form').find('.spelling').remove();
	var artistUrl = eventfulApi.eventfulUrl;
	var params = {
		'api_key': eventfulApi.eventfulApiKey,
		'keywords': name,
		'date': 'Future'
	}
	$.getJSON(artistUrl, params, function(data) {
		console.log("artist data", data);
		if (!data) {
			console.log("no data");
		}
		if (data.Artists.length > 1) {
			return loadDidYouMean(data);
		}
		if (data.Artists.length == 0) {
			console.log('No results found');
			$('#eventlist').find($('.loading')).remove();
			$('#js-search-form').append('<p class="spelling">No results found. Check the spelling?</p>');
			return;
		}
		if (data.Artists.length == 1) {
			console.log(data.Artists);
			artistId=data.Artists[0].Id;
			console.log("artistId", artistId);
			return getEventList(artistId, eventfulApi);
		}
	});
}

function getEventList(artistId, eventfulApi) {
	$('#js-search-form').find('.spelling').remove();
	$('.didYouMean').addClass('hidden');
	var eventUrl = eventfulApi.jamBaseEventUrl;
	var params = {
		'api_key': eventfulApi.jamBaseApiKey,
		'artistId': artistId,
		'page': 0
	}
	$.getJSON(eventUrl, params, function(data) {
		console.log(data);
		if (data.Info.TotalResults == 0) {
			console.log('No results found');
			$('#eventlist').find($('.loading')).remove();
			$('#js-search-form').append('<p class="spelling">No results found. Check the spelling?</p>')
		}
		else if (data) {
			$('#js-search-form').find($('.spelling')).remove();
			displayEvents(data);
		}
		else {
			console.log('No results found');
		}
	})
	return;
}

function loadDidYouMean(data) {
	$('.didYouMeanUl').html('');
	$('.didYouMean').removeClass('hidden');
	$('#eventlist').addClass('hidden');
	changeClasses();
	console.log('loadDidYouMean() running');
	console.log("DATA", data)
		for (var i = 0; i < data.Artists.length; i++) {
			var element = data.Artists[i];
			$('.didYouMeanUl').append(`<li id="${element.Id}" class="artistOption">${element.Name}</li>`)
		}
}

$('.didYouMeanUl').on('click', '.artistOption', function(element) {
	var artistId = element.target.id;
	return getEventList(artistId, eventfulApi);
})

//function for displaying Events
function displayEvents(data) {
	//clear out event list
	$('#eventlist').html("");
	var eventDetails = data.Events;
	$('.didYouMean').addClass('hidden');
	$('#eventlist').removeClass('hidden');
	$('#upcoming').removeClass('hidden');
	$('#results').removeClass('hidden');
	changeClasses();
	var month = null;
	eventDetails.forEach(function(object) {
		var monthName = "";
		if (month !== moment(object.Date).format('MM')) {
			monthName = `<span class="month">${moment(object.Date).format("MMMM YYYY")}</span>`;
			month = moment(object.Date).format('MM');
		}
		var tickets = "";
		if (object.TicketUrl !== "") {
			tickets = '<a href="' + object.url + '" target="_blank"><button class="tixbutton">Tickets!</button></a>';
		}
		let artists = '';
		if (object.Artists.length > 1) {
			object.Artists.forEach(function(element) {
				artists = artists + (element.Name + ", ");
			});
		}
		if (object.Artists.length == 1) {
			artists = object.Artists[0].Name;
		}
			$('#eventlist').append(
				'<div class="eventitem">' +
				monthName +
				'<p class="artists">' + artists + ' at <span class="venue">' + object.Venue.Name + '</span></p>' +
				'<p class="date">' + moment(object.Date).format("LLL") + '</p>' +
				'<p class="address">' + object.Venue.Address + ' ' + object.Venue.City + ' ' + object.Venue.StateCode + ' ' + object.Venue.ZipCode + '</p>' +
				'<button class="mapbutton">Map it!</button>' +
				tickets +
				'<input type="hidden" class="lat" value="' + object.Venue.Latitude + '">' +
				'<input type="hidden" class="lng" value="' + object.Venue.Longitude + '">' +
				'</div>'
		  );
	})
}






//GOOGLE MAPPING API AND FUNCTIONS

//event listener for maping venue location
$('#eventlist').on('click', '.mapbutton', function(event) {
	event.preventDefault();
	var container = $(this).parent();
	var eventlistcontainer = $(this).parent().parent();
	eventlistcontainer.find('#mapcontainer').remove();
	container.append('<div id="mapcontainer"><div class="closebutton"><span class="x">x</span></div><div id="map"></div></div>');
	google.maps.event.trigger(map, 'resize');
	initMap($(this));
})

function initMap(button) {
	var info = button.parent();
	var latitude = info.find($('.lat')).val();
	var longitude = info.find($('.lng')).val();
	var location = {lat: Number(latitude), lng: Number(longitude)};
	var map = new google.maps.Map(document.getElementById('map'), {
	  zoom: 16,
	  center: location
	});
	var marker = new google.maps.Marker({
	  position: location,
	  map: map
	});
}

$('#eventlist').on('click', '.closebutton', function(event) {
	event.preventDefault();
	var eventlistcontainer = $(this).parent().parent();
	eventlistcontainer.find('#mapcontainer').remove();
})


function changeClasses() {
	$('#nav').removeClass('nav1');
	$('#nav').addClass('nav2');
	$('#navtitle').removeClass('navtitle1');
	$('#navtitle').addClass('navtitle2');
	$('#search').removeClass('searchcontainer1');
	$('#search').addClass('searchcontainer2');
	$('#searchbutton').addClass('searchbutton2')
	$('#searchbutton').removeClass('searchbutton')
	$('#powered').removeClass('powered1');
	$('#powered').addClass('powered2');
	$('#js-artist').addClass('inlinesearch');
	$('#js-artist').removeClass('maininput');
	$('.buttoncenter').addClass('buttoncenter2');
	$('.form1').addClass('form2');
	return;
}

});


