// Prevent routing when there are unsaved changes
// ----------------------------------------------

// This function will be called on every route change.
// Return true to 'prevent' the route from changing.
function preventRouteChange(targetContext) {
  if (Session.get("unsavedChanges")) {
    if (!window.confirm("Unsaved changes will be lost. Are you sure?")) {
      return true;
    }
    Session.set("unsavedChanges", false);
  }
  return false;
}

// Workaround FlowRouter to provide the ability to prevent route changes
var previousPath,
  isReverting,
  routeCounter = 0,
  routeCountOnPopState;

window.onpopstate = function() {
  // For detecting whether the user pressed back/forward button.
  routeCountOnPopState = routeCounter;
};

FlowRouter.triggers.exit([
  function(context, redirect, stop) {
    // Before we leave the route, cache the current path.
    previousPath = context.path;
  }
]);

FlowRouter.triggers.enter([
  function(context, redirect, stop) {
    routeCounter++;

    if (isReverting) {
      isReverting = false;
      // This time, we are simply 'undoing' the previous (prevented) route change.
      // So we don't want to actually fire any route actions.
      stop();
    } else if (preventRouteChange(context)) {
      // This route change is not allowed at the present time.

      // Prevent the route from firing.
      stop();

      isReverting = true;

      if (routeCountOnPopState == routeCounter - 1) {
        // This route change was due to browser history - e.g. back/forward button was clicked.
        // We want to undo this route change without overwriting the current history entry.
        // We can't use redirect() because it would overwrite the history entry we are trying
        // to preserve.

        // setTimeout allows FlowRouter to finish handling the current route change.
        // Without it, calling FlowRouter.go() at this stage would cause problems (we would
        // ultimately end up at the wrong URL, i.e. that of the current context).
        setTimeout(function() {
          FlowRouter.go(previousPath);
        });
      } else {
        // This is a regular route change, e.g. user clicked a navigation control.
        // setTimeout for the same reasons as above.
        setTimeout(function() {
          // Since we know the user didn't navigate using browser history, we can safely use
          // history.back(), keeping the browser history clean.
          history.back();
        });
      }
    }
  }
]);
