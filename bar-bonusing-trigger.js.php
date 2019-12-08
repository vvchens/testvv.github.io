/**
 * Created by ryan.desroches on 3/28/2017.
 */
/**************************************************************
 // Class:  BarBonusingTrigger
 // Description:  Fetched the BAR object, and then determines
 //               if a flyout or an awarded game should be shown
 //               to the user.
 //
 // Inputs:  None
 //
 // Returns: None
 //
 // Displays:  A popup for the game invite (reward) or
 //            flyouts that indicate the progress to a bonus/reward
 //
 // Requires:  This library requires:
 //             - bonusingUtility.js
 //             - gauge-utilities.js
 //             - flyout.js
 //             - bonusing-gauges.js
 //             - circe-progress.js
 //             - jQuery
 //             - localstorage
 //             - fancybox or ModalJs (bootstrap)
 //
 //
 */


function BarBonusingTrigger()
{
  var self = this;
  // The BonusAwarded event will notify pages that a reward was granted
  // and that they should display (if applicable) the reward for the
  // promotion.
  //
  this.bonusAwardedEvent = new CustomEvent('BonusAwarded');
  this.gameAnnouncementModal = "";
  this.gameIframeModal = "";

  // Stores rewarded bar objects that will be used for the game(s)
  this.pendingGames = [];


  //*************************************************************
  // getRandomUnplayedGameId
  // Gets the list of GameIds from the BAR, throws out the game
  // the player last played and then picks a game ID at random
  // from the remaining list.
  //
  this.getRandomUnplayedGameId = function ()
  {
    try
    {
      if ( typeof HasLocalStorage != "function" || ! HasLocalStorage() )
      {
        throw "Cannot use local storage";
      }

      if (!self.pendingGames[0])
      {
        throw "Unexpected: No Games to play";
      }

      // check to see if the reveal is set on the pendingGames.
      var availableGames = [];
      if (( self.pendingGames[0].reveal == null ) || ( self.pendingGames[0].reveal == 0 ))
      {
        var defaultGameId = "57b8ece4b04fe4c906ed39ba";
        // all we got is the default game ID, so return it.
        return defaultGameId;
      }
      else
      {
        availableGames = self.pendingGames[0].reveal;
      }

      // Only randomize the game if we have more than one game to work with.    If there is only
      // one game to play -  then play it.
      if( ! Array.isArray(availableGames) || availableGames.length === 0 )
      {
        throw "Unexpected: No Games to play";
      }
      else if (availableGames.length === 1)
      {
        return availableGames[0];
      }
      else
      {

        var lastGamePlayed = localStorageGetJson("lastGamePlayed");
        if (lastGamePlayed)
        {
          availableGames.removeByValue(lastGamePlayed);
        }

        var randGameIndex = Math.floor(Math.random() * ( availableGames.length )),
            randomGameId  = availableGames[randGameIndex];

        localStorageSetJson("lastGamePlayed", randomGameId);
        return randomGameId;
      }
    }
    catch (err)
    {
      console.warn("Bonusing Error " + err);
    }

  };  // end getRandomUnplayedGameId.

  //*************************************************************
  // checkPendingGames
  // Checks to see if there are bar objects that are rewarded and
  // then tries to pop up the game for that rewarded bar object
  //
  // Input: None
  //
  //
  this.checkPendingGames = function ()
  {
    if (this.pendingGames.length > 0)
    {

      // If we were awarded something, but the reward object is
      // empty or null - that means the user won nothing.   We still show the game, but we can
      // ignore any other error checking on the reward object.
      //
      // NOTE:  For Next Gen Loyality - the reward can be an array
      //
      if (( !self.pendingGames[0].rewards ) || ( self.pendingGames[0].length < 1 ))
      {
        self.contactGameEngine();
      }
      else
      {

        for (var i = 0; i < self.pendingGames[0].rewards.length; i++)
        {
          var thisReward = self.pendingGames[0].rewards[i].reward;
          // If the user got a reward, but the actual amount won is less than
          // the intent amount - something bad happened and a dialog will be presented instead
          // of a spin.
          if (parseInt(thisReward.actual_amount) < parseInt(thisReward.intent_amount))
          {
            var alertTitle   = "ERROR",
                alertContent = 'There was an error with your reward. Please contact customer support.';

            // If the reward is a coupon, or the reward has a state of failed - just give a generic error
            // to contact customer service
            if (thisReward.state === "failed")
            {
              alertTitle = self.pendingGames[0].promotionname + " ERROR";
              alertContent = 'There was an error with your reward. Please contact customer support.';
            }
            else if ( ( thisReward.currency === 'lotteryproducts') || ( thisReward.currency === "experiential" ) )
            {
              alertTitle = self.pendingGames[0].promotionname + " ERROR";
              alertContent = 'Your Coupon prize will be delivered soon.  We apologize for the delay. ';
            }
            else
            {

              var pointsType = thisReward.type;
              if (pointsType == "PointsForDrawings")
              {
                pointsType = "draw points";
              }
              else if (pointsType == "PointsForPrizes")
              {
                pointsType = "prize points";
              }
              else
              {
                pointsType = thisReward.currency;
              }

              alertTitle = "Points Limit Reached";
              alertContent = "You have hit your points limit, "
                + thisReward.actual_amount + " "
                + pointsType + " were awarded for " +
                "this promotion";
            }
            customAlert(alertTitle, alertContent);
            $('.bonusingAlert').on('dialogclose', function ()
            {
              if (self.pendingGames)
              {
                self.pendingGames.shift();
              }
              self.checkPendingGames();
            });
          }
          // Only show the game IF we have more than one award possibility.
          else if (self.pendingGames[0].rewards[i].awards.length <= 1)
          {
            // event should already been raised, so just skip this game
            if (self.pendingGames)
            {
              self.pendingGames.shift();
            }
            document.getElementsByClassName('BonusingResults')[0].style.display = "block";
            self.checkPendingGames();
          }
          // Finally all errors should be checked - so try to show the game.
          else
          {
            self.contactGameEngine();
          }
        } // end else reward exists
      } // end for rewards.length
    }
  };


  //*************************************************************
  // contactGameEngine
  //
  // Contact the Game engine with the Current Awarded BAR Object
  //
  //
  this.contactGameEngine = function ()
  {
    // Construct the game ONE at a time - using the first element in this array.
    // when the game closes,  the array will be shifted to put a new bar object in
    // as the first element.   That logic is handled in this.notification which will
    // recursivly call this function.
    var inviteDetails = self.pendingGames[0]

    // username, password and game ID for this game.
    var token        = "cURL Error #:couldn't connect to host",
        gameId       = self.getRandomUnplayedGameId(),
        gameServer   = "https://uat.sglotterygames.com/",
        gameOptions  = {},
        gamesApiData = {};

    // now that the token is given, set up the data we need to give to the
    // actual game
    gameOptions.environment = "test";
    gameOptions.gameId = gameId;
    gameOptions.serverType = "Static";
    if ( 2 == 2 )
    {
      gameOptions.sageOptions = inviteDetails.rewards[0].reward.reward_id;
      // The Game just cares about the awards part of the BAR object.
      gameOptions.outcomeData = inviteDetails.rewards[0].awards;
    }
    else
    {
      gameOptions.outcomeData = { awards: inviteDetails.rewards[0].awards };
    }
    gamesApiData = {
      options: JSON.stringify(gameOptions)
    };

    // Get the game now
    var gameResult = $.ajax({
      type:        "POST",
      url:         gameServer + "api/games/url?token=" + token,
      data:        gamesApiData,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
    });


    gameResult.done(function (gameLaunchData)
    {
      if (gameLaunchData.success)
      {
        var gameUrl = gameLaunchData.gameUrl;
        var promoName = inviteDetails.promotionname;
        self.notification(promoName, gameUrl);
      }
      else
      {
        console.warn("Bad GameData returned - " + gameLaunchData);
        if ( self.pendingGames )
        {
          self.pendingGames.shift();
        }
        self.checkPendingGames();
        alertTitle = "Error"
        alertContent = 'There was an error with your reward. Please contact customer support.';
      }
    });  // end gameResult.success

    gameResult.fail(function (error)
    {
      console.warn("Could not load game from gameserver - " + error.message);
      if (self.pendingGames)
      {
        self.pendingGames.shift();
      }
      self.checkPendingGames();
      alertTitle = "Error"
      alertContent = 'There was an error with your reward. Please contact customer support.';
    }); // end gameResult.fail
  }; // end contactGameEngine

  //*************************************************************
  // skipGame ( Callback )
  //
  // Callback function for when the Skip button is pressed on
  // the gameAnnouncement modal.    Will skip ALL games and just
  // show the result of the rewards.
  //
  //
  this.skipGame = function (event)
  {
    var bonusingResults =  $('.BonusingResults'),
        bonusingPrizes = $('#BonusPrizes');
    self.gameAnnouncementModal.hide();
    self.pendingGames = [];
    // check to make sure these classes/IDs exist before trying to show them.
    if ( bonusingResults.length > 0 )
    {
      bonusingResults.show();
    }
    if ( bonusingPrizes )
    {
      bonusingPrizes.removeClass('hidden d-none');
    }
  }; // end skipGame

  //*************************************************************
  // playGame ( Callback )
  //
  // Callback function for when the play button is pressed on
  // the gameAnouncement modal.  Attempts to pop up a new modal
  // with the game Iframe.
  //
  //
  this.playGame = function ( gameUrl )
  {
    this.gameAnnouncementModal.hide();
    this.gameIframeModal = new ModalJs(
      {
        type:       "iframe",
        title:      "Play Game",
        messages:   [gameUrl],
        class:      "fullScreenModal",
        zIndex: 1200,
        showCloseX: "false"
      });
    this.gameIframeModal.show();

    window.addEventListener('message', function (e)
    {
      if (e.data.type === 'enterTicket')
      {
        // Move to the next game if there is one, if not - close and
        // show the results to the user.
        self.pendingGames.shift();
        if (self.pendingGames.length > 0)
        {
          self.gameIframeModal.hide();
          self.checkPendingGames();
        }
        else 
        {
          // Make sure all game announcements are closed
          $('.gameAnnouncementModal').modal('hide');
          self.gameIframeModal.hide();
          // show the results to the user
          $('#BonusPrizes').removeClass( 'hidden d-none' );
        }
      }
    }); // end message event listener
  }; // end PlayGame

  //*************************************************************
  // showBootstrapNotification
  // Responsible for displaying the Spin Notification and game
  // using bootstrap's modals.
  //
  // Input:
  //      promoName  - name of winning promotion
  //      GameUrl -  URL that will display the game
  //
  //
  this.showBootstrapNotifications = function (promoName, gameUrl)
  {
    this.gameAnnouncementModal = new ModalJs(
      {
        title:    "Congratulations!",
        messages: [promoName],
        zIndex: 1200,
        showCloseX: "false",
        class: "gameAnnouncementModal",
        buttons:  [
          {
            id: "playNowBtn", label: "Play Now", callback: function ()
          {
            self.playGame( gameUrl )
          }
          },
          {
            id: "skipGameBtn", label: "Skip Game", class:"btn-secondary", callback: function ()
          {
            self.skipGame()
          }
          }
        ]
      });
    self.gameAnnouncementModal.show();

  };

  this.showFancyboxNotifications = function (promoName, gameUrl)
  {
    $.fancybox(
      {
        type:      'ajax',
        href:      '/gamespinpopup',
        modal:     true,
        padding:   0,
        width:     300,
        height:    'auto',
        autoSize:  false,
        afterShow: function ()
                   {
                     // Insert the promotion name into the popup
                     var promoNameContainer = document.getElementsByClassName('name');
                     if (promoNameContainer.length > 0)
                     {
                       promoNameContainer[0].innerHTML = promoName;
                     }
                   }
      });


    // If play game is clicked
    // Close fancybox and open a new one to display the game
    $(document).on('click touchstart', '#playGame', function ()
    {
      window.$.fancybox.close();

      $.fancybox(
        {
          type:      'iframe',
          href:      gameUrl,
          modal:     true,
          padding:   0,
          autoScale: true
        });
    });

    window.addEventListener('message', function (e)
    {
      if (e.data.type === 'enterTicket')
      {
        // Move to the next game if there is one, if not - close and
        // show the results to the user.
        self.pendingGames.shift();
        window.$.fancybox.close();
        if (self.pendingGames.length > 0)
        {
          self.checkPendingGames();
        }
        else
        {
          // show the results to the user
          $('.BonusingResults').show();
        }
      }
    });
  }; // end showFancyboxNotifications

  //*************************************************************
  // notification
  // Responsible for displaying the Spin Notification and Game Iframe
  //
  // Input:
  //      promoName  - name of winning promotion
  //      GameUrl -  URL that will display the game
  //
  //
  this.notification = function (promoName, gameUrl)
  {
    // Detect Bootstrap
    var bootstrap_enabled = ( typeof $().modal == 'function' ),
        fancybox_enabled  = (typeof $.fancybox == 'function');

    if (bootstrap_enabled)
    {
      self.showBootstrapNotifications( promoName, gameUrl);

    }
    else if (fancybox_enabled)
    {
      self.showFancyboxNotifications( promoName, gameUrl);

    } // end else if fancybox;
    else
    {
      throw 'No library to show notifications';
    }

    // If skip game is clicked - remove all games from the pendingGames array and
    // Close fancybox
    $(document).on('click touchstart', '#skipGame', function ()
    {
      self.pendingGames = [];
      window.$.fancybox.close();
      $('.BonusingResults').show();

    });

  };

  //*************************************************************
  // getBarData
  // Gets the data from the BAR object and then determines if
  // the game should be awarded or a flyout pops up.
  //
  // Input: none
  //
  //
  this.getBarData = function ()
  {
    try
    {

      // Get the Bar Object from the global window object.
      var barObject = window.barObject;

            console.log("BAR OBJECT IS - \n" + JSON.stringify(barObject));
      
      if (barObject)
      {
        var barObjectLength = barObject.length,
            flyoutNumber    = 0;
        for (var i = 0; i < barObjectLength; i++)
        {
          // check to see if the result is something we care about right now
          if ((barObject[i].result === 'playerlimited') ||
            (barObject[i].result === 'globallimited') ||
            (barObject[i].result === 'nomatch'))
          {
            // do nothing - user will find out if the promotion is
            // limited on the my rewards page
            continue;
          }
          else if (barObject[i].result == "awarded")
          {
            self.pendingGames.push(barObject[i]);

            // the parent page needs to know about the award even if the
            // user skips the game.
            //
            // Raise a custom event for the parent page
            self.bonusAwardedEvent.initCustomEvent('BonusAwarded', true, false,
              {
                detail: barObject[i]
              });
            document.dispatchEvent(self.bonusAwardedEvent);
          }
          else if (barObject[i].result == "notry")
          {
            // Show flyouts only if we have gauges for the flyout.
            if ((typeof Flyout == 'function') && ( barObject[i].gauges.length > 0  ))
            {
              // TBD - right now no description for the reward or promotion
              // will show on the flyout.
              var flyoutDescription = "",
                  flyoutOptions     = {};

              flyoutNumber++;

              // Build the options
              flyoutOptions.useStylesheet = true;
              flyoutOptions.gauges = barObject[i].gauges;
              flyoutOptions.flyoutNumber = flyoutNumber;

              // popup the flyout
              var promotionFlyout = new Flyout(
                barObject[i].promotionname,
                flyoutDescription,
                flyoutOptions);

            }
            else
            {
              console.warn("Flyout library is not loaded");
              return;
            }
          }
        } // end for barObjectLength

        self.checkPendingGames();
      } // end if barObject
    } // end try
    catch (err)
    {
      console.warn("Error in gettingBarObject " + err);
    }
  }; // end getBarData
}; // end BarBonusingTrigger

// For all pages, get the BAR data and see what changed.
$(function ()
{
  window.barChecker = new BarBonusingTrigger();
  window.barChecker.getBarData();
});
