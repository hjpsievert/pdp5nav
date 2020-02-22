import React, { Component } from 'react';
import { Animated } from 'react-native';

export default class SlideInView extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      swipeSideAnim: new Animated.Value(props.sideStart),
      swipeUpAnim: new Animated.Value(props.upStart),
    }
  }

  componentDidMount() {
    Animated.timing(  
      this.state.swipeSideAnim,
      {
        toValue: this.props.sideEnd,
        duration: this.props.duration, 
      }
    ).start();  
    Animated.timing(
      this.state.swipeUpAnim, 
      {
        toValue: this.props.upEnd,
        duration: this.props.duration,
      }
    ).start();
  }

  render() {
    let { swipeSideAnim, swipeUpAnim } = this.state;

    return (
      <Animated.View 
        style={{
          ...this.props.style,
          position: 'absolute',
          top:  this.props.slideTop ? swipeUpAnim : 0 ,
          // top:  25 ,
          bottom: this.props.slideTop ? null : swipeUpAnim,
          left: swipeSideAnim,
        }}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}
