"use strict";

var GeoStatic = {
  SdkModes: {
    solus: 'solus',
    mobile: 'mobile'
  },
  GeoPacketEventName: 'GeoPacketSuccess',
  DefaultContainerId: 'geospinner',
  mdiIsNativeShell: function()
  {
    if( navigator.userAgent.match( /(Mdi Native Shell)/ ) )
    {
      return true;
    }
    else
    {
      return false; //this is the browser
    }
  }
};

// Solus and Geocomply SDKs will return error numbers.
GeoStatic.ErrorMap = {
  '0': {
    errorname: 'NONE',
    solus_errorname: 'CLNT_OK',
    message: 'OK'
  },
  '600': {
    errorname: 'UNEXPECTED',
    solus_errorname: 'CLNT_ERROR_UNEXPECTED',
    message: 'Unexpected error occurred'
  },
  '602': {
    errorname: 'NETWORK_CONNECTION',
    solus_errorname: 'CLNT_ERROR_NETWORK_CONNECTION',
    message: 'The network connection is not available'
  },
  '603': {
    errorname: 'SERVER_COMMUNICATION',
    solus_errorname: 'CLNT_ERROR_SERVER_COMMUNICATION',
    message: 'Server communication error'
  },
  '604': {
    errorname: 'CLIENT_SUSPENDED',
    solus_errorname: 'CLNT_ERROR_CLIENT_SUSPENDED',
    message: 'The client account is suspended'
  },
  '605': {
    errorname: 'DISABLED_SOLUTION',
    solus_errorname: 'CLNT_ERROR_DISABLED_SOLUTION',
    message: 'The geolocation solution is disabled'
  },
  '606': {
    errorname: 'INVALID_LICENSE_FORMAT',
    solus_errorname: 'CLNT_ERROR_LICENSE_INVALID_FORMAT',
    message: 'The license has invalid format'
  },
  '607': {
    errorname: 'CLIENT_LICENSE_UNAUTHORIZED',
    solus_errorname: 'CLNT_ERROR_LICENSE_UNAUTHORIZED',
    message: 'The license is unauthorized by server'
  },
  '608': {
    errorname: 'LICENSE_EXPIRED',
    solus_errorname: 'CLNT_ERROR_LICENSE_EXPIRED',
    message: 'The license is expired'
  },
  '609': {
    errorname: 'INVALID_CUSTOM_FIELDS',
    solus_errorname: 'CLNT_ERROR_INVALID_CUSTOM_FIELDS',
    message: 'The custom fields list is invalid'
  },
  '611': {
    errorname: 'REQUEST_CANCELED',
    message: 'The geolocation request was cancelled by the operator app. The request can be cancelled by operator app if the operator app implements GeoComplyClientDeviceConfigListener interface.'
  },
  '614': {
    errorname: 'GEOLOCATION_IN_PROGRESS',
    solus_errorname: 'CLNT_ERROR_REQUEST_GEOLOCATION_IN_PROGRESS',
    message: 'Previous geolocation is not finished'
  },
  '615': {
    errorname: 'PERMISSIONS_NOT_GRANTED',
    message: 'The operator application doesnâ€™t ask for granting or if end users refuse to grant ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION permissions'
  },
  '616': {
    errorname: 'GOOGLE_PLAY_SERVICE_NOT_FOUND',
    message: 'There are no external packages required by GeoComply SDK are imported to the operator app'
  },
  '617': {
    errorname: 'DEVICE_CALLBACK_NOT_FOUND',
    message: 'The operator application did not implement GeoComplyClientDeviceConfigListener class and set it back to GeoComplyClient instance'
  },
  '620': {
    errorname: false,
    solus_errorname: 'CLNT_ERROR_INVALID_RESPONSE',
    message: 'Invalid server Response'
  },
  '635': {
    errorname: 'INVALID_USER_INPUT',
    message: 'User input (user id, reason, phone number or custom fields) contains symbols or characters that are not accepted'
  },
  '801': {
    errorname: false,
    solus_errorname: 'CLNT_ERROR_BROWSER_NOT_COMPATIBLE',
    message: 'Current browser is incompatible with HTML5 geolocation'
  },
  '802': {
    errorname: false,
    solus_errorname: 'CLNT_ERROR_BROWSER_GEOLOCATION_UNAVAILABLE',
    message: 'Browser HTML5 geolocation is unavailable'
  },
  '803': {
    errorname: false,
    solus_errorname: 'CLNT_ERROR_BROWSER_GEOLOCATION_DENIED',
    message: 'Browser HTML5 geolocation access denied'
  },
  '804': {
    errorname: false,
    solus_errorname: 'CLNT_ERROR_BROWSER_GEOLOCATION_TIMEOUT',
    message: 'Browser HTML5 geolocation timed out'
  },
  '805': {
    errorname: false,
    solus_errorname: 'CLNT_ERROR_BROWSER_GEOLOCATION_UNKNOWN',
    message: 'Browser HTML5 geolocation unknown problem'
  }
};

function GeoCompliance( Options )
{
  var self = this;
  self.GeoPacket = '';
  self.Client = false;

  // set up options
  self.AjaxMode = Options.AjaxMode || false;
  self.ContainerId = Options.ContainerId || GeoStatic.DefaultContainerId;
  self.DoLog = Options.DoLog || false;
  self.LogModal = Options.LogModal || false;
  self.LoggerId = Options.LoggerId || 'geologger';
  self.Player = Options.Player;
  self.RestrictedURL = Options.RestrictedURL || window.location.href;
  self.License = Options.License;
  self.SdkMode = Options.SdkMode || GeoStatic.SdkModes.solus;
  self.Reason = Options.Reason || self.RestrictedURL;
  self.PostFormId = Options.PostFormId || false;

  self.initGeoClient = function()
  {
    if( self.AjaxMode )
    {
      if( !self.PostFormId )
      {
        console.error( 'Geo Form ID Not Set' );
        window.location.href = '/error';

        // Throw here to prevent further JS execution. Uncaught.
        throw "Geo template needs post form id";
      }

      self.showGeoModal();
    }

    self.Client = GcHtml5.createClient( null, self.geoLogger );
    self.Client.setUserId( self.Player );
    self.Client.setReason( self.Reason );
    self.Client.setLicense( self.License );

    // Register the handler to process the beginning of the geolocation event
    self.Client.events.on( 'before', function()
    {
      self.geoLogger( 'geo before' );
    } );

    // Register the onSuccess handler
    self.Client.events.on( 'engine.success', function( text, xml )
    {
      // Process the response XML
      self.geoSuccess( text );
    } );

    // Register error handler
    self.Client.events.on( '*.failed', function( code, message )
    {
      self.geoLogger( this.event );

      switch( code )
      {
        case self.Client.ErrorCodes.CLNT_ERROR_BROWSER_NOT_COMPATIBLE:
        case self.Client.ErrorCodes.CLNT_ERROR_BROWSER_GEOLOCATION_DENIED:
        case self.Client.ErrorCodes.CLNT_ERROR_BROWSER_GEOLOCATION_TIMEOUT:
        case self.Client.ErrorCodes.CLNT_ERROR_BROWSER_GEOLOCATION_UNAVAILABLE:
        case self.Client.ErrorCodes.CLNT_ERROR_BROWSER_GEOLOCATION_UNKNOWN:
          /*
          browser.failed will throw one of the following
          error codes: 802, 803, 804, 805
           When this event is fired, the geolocation process will still
          continue as normal. It is just that the browser geolocation
          data is not available.
          */
          break;

        case 902:
          /*
          init.failed: error code returned by this event is 902
           This happens when the dependencies are not available.
          Currently, Solus JS only depends on SWFObject.
          When this event is fired, the geolocation process will still
          continue as normal.
          */
          break;

        default:
          // Report error to player
          self.geoFailure( code, message );
      }
    } );
  };

  self.showGeoModal = function()
  {
    // launch processing notice and spinner
    $.colorbox( {
      inline: true,
      width: "310",
      height: "380",
      href: "#geospinner",
      trapFocus: true,
      overlayClose: false,
      escKey: false,
      closeButton: false
    } );
  };

  self.initGeoLogger = function()
  {
    if( !self.DoLog )
    {
      return;
    }

    var logdiv = $( '<div>', {
      id: self.LoggerId
    } );
    $( "#".concat( self.ContainerId ) ).append( logdiv );

    if( self.LogModal )
    {
      $( "#".concat( self.LoggerId ) ).dialog();
    }

    self.geoLogger( Options );
  };

  self.geoLogger = function( msg )
  {
    if( !self.DoLog )
    {
      return;
    }

    var block = $( '<div>', {
      "class": 'error',
      text: JSON.stringify( msg )
    } );
    $( "#".concat( self.LoggerId ) ).append( block );
    console.log( '\t\t--geocomply: ' + msg );
  };

  self.JsonSuccess = function( data )
  {
    var geoPacket = JSON.parse( data ).geopacket;
    self.geoSuccess( geoPacket );
  };

  self.JsonFailure = function( data )
  {
    var dataObj = JSON.parse( data );
    var code = dataObj.errorCode;
    var message = dataObj.errorMessage;
    self.geoFailure( code, message );
  };

  self.geoSuccess = function( geoPacket )
  {
    self.GeoPacket = geoPacket;

    if( self.AjaxMode )
    {
      $.colorbox.close();

      // geoPacket via ajax is already encoded, do not re-encode.
      GeoStatic.GeoPacket = geoPacket;
      // Let the document know that geopacket is ready.
      // Do not redirect.
      // Form that implements GeoComply will send packet with form data.

      $( document ).trigger( GeoStatic.GeoPacketEventName, [geoPacket] );

      // Add geopacket to form
      var GeoPacketInput = $( '<input>', {
        name: 'GeoPacket',
        value: GeoStatic.GeoPacket,
        "class": 'hidden'
      } );
      $( "#".concat( self.PostFormId ) ).append( GeoPacketInput );
      return;
    }

    self.GeoPacket = encodeURIComponent( geoPacket );

    // Redirect to requested url + geopacket
    var URL = self.insertParam( self.RestrictedURL, 'GeoPacket', self.GetGeoPacket() );
//    window.location.href = URL;
    alert("GeoPacket")
    location.reload();
  };

  self.geoFailure = function( code, message )
  {
    self.geoSuccess({"geoPacket":message});
    return;
    var Result = {};
    var ThisError;

    if( typeof GeoStatic.ErrorMap[String( code )] == 'undefined' )
    {
      console.error( "Unknown error code ".concat( code ) );
      window.location.href = '/error';

      // Throw here to prevent further JS execution. Uncaught.
      throw "Unknown error code ".concat( code );
    }

    ThisError = GeoStatic.ErrorMap[String( code )];

    switch( self.SdkMode )
    {
      case GeoStatic.SdkModes.mobile:
        Result = {
          GeoError: ThisError.errorname,
          GeoMessage: ThisError.message
        };
        break;

      case GeoStatic.SdkModes.solus:
        // Prefer geocomply name. Use Solus SDK error string when geocomply string is not mapped.
        Result = {
          GeoError: ThisError.errorname || ThisError.solus_errorname,
          GeoMessage: ThisError.message
        };
        break;

      default:
        console.error( "Unknown SDK mode ".concat( self.SdkMode ) );
        window.location.href = '/error';

        // Throw here to prevent further JS execution. Uncaught.
        throw "Unknown SDK mode ".concat( self.SdkMode );
    }

    if( self.AjaxMode )
    {
      // POST the error
      var $form = $( '<form>', {
        action: $( "#".concat( self.PostFormId ) ).attr( 'action' ),
        method: 'POST'
      } );
      $form.append( $( '<input>', {
        type: 'hidden',
        name: 'GeoError',
        value: Result.GeoError
      } ) );
      $form.append( $( '<input>', {
        type: 'hidden',
        name: 'GeoMessage',
        value: Result.GeoMessage
      } ) );
      $( 'body' ).append( $form );
      $form.submit();
    }
    else
    {
      Result.GeoError = encodeURIComponent( Result.GeoError );
      Result.GeoMessage = encodeURIComponent( Result.GeoMessage );
      window.location.href = "".concat( self.RestrictedURL, "?GeoError=" ).concat( Result.GeoError, "&GeoMessage=" ).concat( Result.GeoMessage );
    }
  };

  self.insertParam = function( URL, key, value )
  {
    var matched = false;
    var UrlParts = URL.split( '?' );
    var domain = UrlParts[0];
    var searchParams = UrlParts[1];
    var queries = [];

    if( typeof searchParams != 'undefined' )
    {
      searchParams = searchParams.split( '#' )[0];
      queries = searchParams.split( '&' );

      for( var i = 0; i < queries.length; i++ )
      {
        x = [];

        // key
        x[0] = queries[i].substr( 0, queries[i].indexOf( '=' ) );

        // value
        x[1] = queries[i].substr( queries[i].indexOf( '=' ) + 1 );

        if( x[0] == key )
        {
          x[1] = value;
          queries[i] = x.join( '=' );
          matched = true;
        }
      }
    }

    if( !matched )
    {
      queries.push( [key, value].join( '=' ) );
    }

    return domain + '?' + queries.join( '&' );
  };

  self.GetPlayer = function()
  {
    return self.Player;
  };

  self.GetLicense = function()
  {
    return self.License;
  };

  self.GetUrl = function()
  {
    return self.RestrictedURL;
  };

  self.GetGeoPacket = function()
  {
    return self.GeoPacket;
  };

  // Self-initialize
  self.initGeoLogger();

  // Initilize solus sdk if solus mode (solus sdk not included in mobile template)
  if( self.SdkMode == GeoStatic.SdkModes.solus )
  {
    self.initGeoClient();
  }
}
