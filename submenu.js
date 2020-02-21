$(document).ready(function () {
  $('li .has-menu').click(function () {
    if ( !( $( this ).parent().hasClass( 'current' ) ) ) {
      $( 'ul:first', $(this).parent()).slideToggle( 'fast' );
    }
    else { return; }
    $( this ).parent().toggleClass( 'opened' );
  });
});