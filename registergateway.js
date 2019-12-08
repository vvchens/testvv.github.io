/**
 * This flag indicates if the system is ready to operate 
 * with shared services ... which includes successful
 * device registration and retrieval of device information
 * from the mobile gateway.
 */
var deviceReady = false;

// Device signature.
var deviceSig = 'testsig';

// Device Registration ID
var deviceId = 'testid';

/*
 * Returns an object with three members:
 * deviceReady -- true if device initialized and registered with the mobile gateway
 * deviceId --- the device registration ID from the mobile gateway
 * deviceSig -- the signature calculated by the mobile gateway
 */
function getThisMobileInfo()
{
  return {
    deviceReady : deviceReady,
    deviceId : deviceId,
    deviceSig : deviceSig
  };
}

function onDeviceReady()
{
  if( ( typeof mdiIsNativeShell != 'function' || ! mdiIsNativeShell() ) && ( typeof mdiIsPartnerApp != 'function' || ! mdiIsPartnerApp() ) )
  {
    setErrorStatus("Application Problem: Native Shell Not Detected");
    return;
  }

  MdiNativeShell.getMobileGatewayInfo(
    function( result )
    {
      console.log("receive getMobileGatewayInfo" );
      clearTimeout( DeviceReadyTimeout );
      clearErrorStatus();

      // Make sure result is not a string primitive or String object
      var errorStr = 'Your device has not been successfully registered. Please close the app and try again.';
      if ( ( typeof result ) == 'string' )
      {
        setErrorStatus( errorStr );
        return;
      }
  
      var toClass = {}.toString;
      var classStr = toClass.call(result);
      if ( classStr.indexOf( 'String' ) != -1 )
      {
        // This is a String object ... still an error
        setErrorStatus( errorStr );
        return;
      }
      deviceId = result.deviceRegId;
      deviceSig = result.sig;
      deviceReady = true;

      // setErrorStatus( "id:" + deviceId);
      // setErrorStatus( "sig:" + deviceSig);

      $(document).trigger('MobileRegisterComplete');
    },
    function ( errorMsg ) {
      setErrorStatus("failed to get mobile gateway info");
      setErrorStatus( errorMsg );
    }
  );
}

// This adds deviceready eventlistener unconditionally *before* the application initializes.
document.addEventListener('deviceready', onDeviceReady, false);
// Show a warning after 10 seconds without a deviceready event. This warning will still be cleared if the
// deviceready event is triggered later.
var DeviceReadyTimeout = setTimeout( WarnDeviceNotReady, 10000 );

function WarnDeviceNotReady()
{
  setErrorStatus("Application Problem: Native Shell Not Detected");
}

$( function()
{
  if( $( '.playslipErrorStatus' ).length === 0 )
  {
    $('.playSlipWrapper').prepend( '<div class="playslipErrorStatus"></div>' );
  }
} );

function setErrorStatus(msg)
{
  console.log("-----------------"+msg);
  $( '.playslipErrorStatus' ).html( $( '.playslipErrorStatus' ).html() + "<br>" + msg );
  $( '.playslipErrorStatus' ).show();
}

function clearErrorStatus()
{
  $( '.playslipErrorStatus' ).html( '' );
  $( '.playslipErrorStatus' ).hide();
}


