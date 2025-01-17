var changeAnimationDuration = 500;
var resizeAnimationDuration = 1000;

function Marker(poiData) {

    this.poiData = poiData;
    this.isSelected = false;

    /*
        With AR.PropertyAnimations you are able to animate almost any property of ARchitect objects. This sample
        will animate the opacity of both background drawables so that one will fade out while the other one fades
        in. The scaling is animated too. The marker size changes over time so the labels need to be animated too in
        order to keep them relative to the background drawable. AR.AnimationGroups are used to synchronize all
        animations in parallel or sequentially.
    */
    this.animationGroupIdle = null;
    this.animationGroupSelected = null;

    /* Create the AR.GeoLocation from the poi data. */
    var markerLocation = new AR.GeoLocation(poiData.latitude, poiData.longitude, poiData.altitude);

    /* Create an AR.ImageDrawable for the marker in idle state. */

    this.markerDrawableIdle = new AR.ImageDrawable(World.markerDrawableIdle, 2.0, {
        zOrder: 0,
        scale: {
            x: 1,
            y: 1,
        },
        onClick: Marker.prototype.getOnClickTrigger(this)

    });


    /* Create an AR.ImageDrawable for the marker in selected state. */
    this.markerDrawableSelected = new AR.ImageDrawable(World.markerDrawableSelected, 2.0, {
        zOrder: 0,
        opacity: 0.0,
        onClick: Marker.prototype.getOnClickTrigger(this)
    });

    /* Create an AR.Label for the marker's title . */
    this.titleLabel = new AR.Label(poiData.title.trunc(12), 1, {
        zOrder: 1,
        translate: {
            x: -1.1,
            y: 0.4
        },
        scale:{
            x: 0.4,
            y: 0.4
        },
        style: {
            textColor: '#000000',
        }
    })

    this.descriptionLabel = new AR.Label(poiData.description.trunc(10), 1, {
        zOrder: 1,
        translate: {
            x: -0.8,
            y: -0.45
        },
        scale: {
            x: 0.6,
            y: 0.6,
        },
        style: {
            textColor: '#000000'
        }
    });

    this.distanceLabel = new AR.Label(poiData.distance.trunc(10), 1, {
        zOrder: 1,
        translate: {
            x: 1.6,
            y: -0.45
        },
        scale: {
            x: 0.5,
            y: 0.5
        },
        style: {
            textColor: '#000000'
        }
    });

    /*
        Create an AR.ImageDrawable using the AR.ImageResource for the direction indicator which was created in the
        World. Set options regarding the offset and anchor of the image so that it will be displayed correctly on
        the edge of the screen.
    */
    this.directionIndicatorDrawable = new AR.ImageDrawable(World.markerDrawableDirectionIndicator, 0.1, {
        enabled: false,
        verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP
    });

    /*
        Create the AR.GeoObject with the drawable objects and define the AR.ImageDrawable as an indicator target on
        the marker AR.GeoObject. The direction indicator is displayed automatically when necessary. AR.Drawable
        subclasses (e.g. AR.Circle) can be used as direction indicators.
    */
    this.markerObject = new AR.GeoObject(markerLocation, {
        drawables: {
            cam: [this.markerDrawableIdle, this.markerDrawableSelected, this.titleLabel, this.descriptionLabel, this.distanceLabel],
            indicator: this.directionIndicatorDrawable
        }
    });

    return this;
}

Marker.prototype.getOnClickTrigger = function(marker) {

    /*
        The setSelected and setDeselected functions are prototype Marker functions.

        Both functions perform the same steps but inverted, hence only one function (setSelected) is covered in
        detail. Three steps are necessary to select the marker. First the state will be set appropriately. Second
        the background drawable will be enabled and the standard background disabled. This is done by setting the
        opacity property to 1.0 for the visible state and to 0.0 for an invisible state. Third the onClick function
        is set only for the background drawable of the selected marker.
    */

    return function() {

        if (!Marker.prototype.isAnyAnimationRunning(marker)) {
            if (marker.isSelected) {

                Marker.prototype.setDeselected(marker);
                try{
                    World.onMarkerDeSelected(marker);
                }catch(err){
                    alert(err);
                }

            } else {
                Marker.prototype.setSelected(marker);
                try {
                    World.onMarkerSelected(marker);
                } catch (err) {
                    alert(err);
                }

            }
        } else {
            AR.logger.debug('a animation is already running');
        }

        return true;
    };
};

/*
    Property Animations allow constant changes to a numeric value/property of an object, dependent on start-value,
    end-value and the duration of the animation. Animations can be seen as functions defining the progress of the
    change on the value. The Animation can be parametrized via easing curves.
*/
Marker.prototype.setSelected = function(marker) {

    marker.isSelected = true;

    /* New: . */
    if (marker.animationGroupSelected === null) {
        var easingCurve = new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        });

        /* Create AR.PropertyAnimation that animates the opacity to 0.0 in order to hide the idle-state-drawable. */

        var idleDrawableResizeAnimationX = new AR.PropertyAnimation(
            marker.markerDrawableIdle, "scale.x", null, 0.0, changeAnimationDuration);

        var idleDrawableResizeAnimationY = new AR.PropertyAnimation(
            marker.markerDrawableIdle, "scale.y", null, 0.0, changeAnimationDuration);


        /* Create AR.PropertyAnimation that animates the opacity to 1.0 in order to show the selected-state-drawable. */
        var showSelectedDrawableAnimation = new AR.PropertyAnimation(
            marker.markerDrawableSelected, "opacity", null, 1.0, changeAnimationDuration);

        var selectedDrawableResizeAnimationX = new AR.PropertyAnimation(
            marker.markerDrawableSelected, 'scale.x', null, 1.2, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the title label to 1.2. */
        var titleLabelResizeAnimationX = new AR.PropertyAnimation(
            marker.titleLabel, 'scale.x', null, 1.2, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the description label to 1.2. */
        var descriptionLabelResizeAnimationX = new AR.PropertyAnimation(
            marker.descriptionLabel, 'scale.x', null, 1.2, resizeAnimationDuration, easingCurve);

        /* Create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.2. */
        var selectedDrawableResizeAnimationY = new AR.PropertyAnimation(
            marker.markerDrawableSelected, 'scale.y', null, 1.2, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the title label to 1.2. */
        var titleLabelResizeAnimationY = new AR.PropertyAnimation(
            marker.titleLabel, 'scale.y', null, 1.2, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the description label to 1.2. */
        var descriptionLabelResizeAnimationY = new AR.PropertyAnimation(
            marker.descriptionLabel, 'scale.y', null, 1.2, resizeAnimationDuration, easingCurve);

        /*
            There are two types of AR.AnimationGroups. Parallel animations are running at the same time,
            sequentials are played one after another. This example uses a parallel AR.AnimationGroup.
        */
        marker.animationGroupSelected = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [
            showSelectedDrawableAnimation,
            idleDrawableResizeAnimationX,
            idleDrawableResizeAnimationY,
            // selectedDrawableResizeAnimationX,
            // titleLabelResizeAnimationX,
            // descriptionLabelResizeAnimationX,
            // selectedDrawableResizeAnimationY,
            // titleLabelResizeAnimationY,
            // descriptionLabelResizeAnimationY,
        ]);
    }

    /* Removes function that is set on the onClick trigger of the idle-state marker. */
    marker.markerDrawableIdle.onClick = null;
    /* Sets the click trigger function for the selected state marker. */
    marker.markerDrawableSelected.onClick = Marker.prototype.getOnClickTrigger(marker);

    /* Enables the direction indicator drawable for the current marker. */
    marker.directionIndicatorDrawable.enabled = true;
    /* Starts the selected-state animation. */
    marker.animationGroupSelected.start();
};

Marker.prototype.setDeselected = function(marker) {

    marker.isSelected = false;

    if (marker.animationGroupIdle === null) {
        var easingCurve = new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        });


        var idleDrawableResizeAnimationX = new AR.PropertyAnimation(
            marker.markerDrawableIdle, "scale.x", null, 1.0, changeAnimationDuration);

        var idleDrawableResizeAnimationY = new AR.PropertyAnimation(
            marker.markerDrawableIdle, "scale.y", null, 1.0, changeAnimationDuration);

        /* Create AR.PropertyAnimation that animates the opacity to 0.0 in order to hide the selected-state-drawable. */
        var hideSelectedDrawableAnimation = new AR.PropertyAnimation(
            marker.markerDrawableSelected, "opacity", null, 0, changeAnimationDuration);
        

        /* Create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.0. */

        /* Create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.0. */
        var selectedDrawableResizeAnimationX = new AR.PropertyAnimation(
            marker.markerDrawableSelected, 'scale.x', null, 1.0, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the title label to 1.0. */
        var titleLabelResizeAnimationX = new AR.PropertyAnimation(
            marker.titleLabel, 'scale.x', null, 1.0, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the description label to 1.0. */
        var descriptionLabelResizeAnimationX = new AR.PropertyAnimation(
            marker.descriptionLabel, 'scale.x', null, 1.0, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.0. */

        /* Create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.0. */
        var selectedDrawableResizeAnimationY = new AR.PropertyAnimation(
            marker.markerDrawableSelected, 'scale.y', null, 1.0, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the title label to 1.0. */
        var titleLabelResizeAnimationY = new AR.PropertyAnimation(
            marker.titleLabel, 'scale.y', null, 1.0, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the description label to 1.0. */
        var descriptionLabelResizeAnimationY = new AR.PropertyAnimation(
            marker.descriptionLabel, 'scale.y', null, 1.0, resizeAnimationDuration, easingCurve);

        /*
            There are two types of AR.AnimationGroups. Parallel animations are running at the same time,
            sequentials are played one after another. This example uses a parallel AR.AnimationGroup.
        */
        marker.animationGroupIdle = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [
            hideSelectedDrawableAnimation,
            idleDrawableResizeAnimationX,
            idleDrawableResizeAnimationY,
            // selectedDrawableResizeAnimationX,
            // titleLabelResizeAnimationX,
            // descriptionLabelResizeAnimationX,
            // selectedDrawableResizeAnimationY,
            // titleLabelResizeAnimationY,
            // descriptionLabelResizeAnimationY,
        ]);
    }

    /* Sets the click trigger function for the idle state marker. */
    marker.markerDrawableIdle.onClick = Marker.prototype.getOnClickTrigger(marker);
    /* Removes function that is set on the onClick trigger of the selected-state marker. */
    marker.markerDrawableSelected.onClick = null;

    /* Disables the direction indicator drawable for the current marker. */
    marker.directionIndicatorDrawable.enabled = false;
    /* Starts the idle-state animation. */
    marker.animationGroupIdle.start();
};

Marker.prototype.isAnyAnimationRunning = function(marker) {

    if (marker.animationGroupIdle === null || marker.animationGroupSelected === null) {
        return false;
    } else {
        return marker.animationGroupIdle.isRunning() === true || marker.animationGroupSelected.isRunning() === true;
    }
};

/* Will truncate all strings longer than given max-length "n". e.g. "foobar".trunc(3) -> "foo...". */
String.prototype.trunc = function(n) {
    return this.substr(0, n - 1) + (this.length > n ? '...' : '');
};