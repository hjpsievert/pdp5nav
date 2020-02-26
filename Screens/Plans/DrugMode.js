import PropTypes from 'prop-types';
import React, { Component } from 'react';
import * as Dispatch from '../../Redux/Dispatches';
import { connect } from 'react-redux';
import SlideInView from '../../Components/SlideInView';
import {
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { Button } from 'react-native-elements';


export class DrugMode extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web'
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);

  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    console.log('pDrugs _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  _handleExitDosage = () => {
    this.props.updateFlowState({
      showMode: false,
    })
  }

  render() {
    const { adjust } = this.state;
    return (
      <SlideInView
        sideStart={Dimensions.get('window').width}
        sideEnd={0}
        upStart={0}
        upEnd={0}
        duration={this.state.duration}
        slideTop={false}
      >
        <View style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35), backgroundColor: 'rgb(255,255,255)' }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 10,
            }}
          >
            <View style={{
              flex: 1,
              alignItems: 'center',
              backgroundColor: 'white',
              borderColor: 'black',
              borderWidth: 1,
            }}
            >
              <Text style={{flex: 1}}>{'This is the Drug Mode Screen'}</Text>
              <Button
                raised={true}
                containerStyle={{width: 200, marginTop: 10, marginBottom: 10, }}
                icon={{ name: 'ios-arrow-dropright', type: 'ionicon', color: 'white' }}
                iconRight
                backgroundColor={'green'}
                color={'white'}
                title={'Exit'}
                onPress={() =>this._handleExitDosage()}
              />
            </View>
          </View>
        </View>
      </SlideInView>
    )
  }
}

DrugMode.propTypes = {
  updateFlowState: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {

  }
}

const mapDispatchToProps = {
  updateFlowState: Dispatch.updateFlowState,
}
// export default withNavigation(ErrorHandler);

export default connect(mapStateToProps, mapDispatchToProps)(DrugMode);