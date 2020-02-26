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
import capitalize from 'lodash/capitalize';


export class DrugDelete extends Component {
  constructor(props, context) {
    super(props, context);
    const { drugToDelete } = props;
        this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      drugDetail: drugToDelete.drugDetail
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

  _handleExitDelete = (doDelete) => {
    this.props.updateFlowState({
      askDelete: false,
      doDelete: doDelete
    })
  }

  render() {
    const { adjust, drugDetail } = this.state;
    const titleText = (drugDetail.isBrand ? capitalize(drugDetail.brandName) + ' (Brand)' : drugDetail.baseName + ' (Generic)') + ', ' + drugDetail.rxStrength + ' ' + drugDetail.units + ' ' + capitalize(drugDetail.pckUnit);    const delWidth = Math.min(Dimensions.get('window').width, 500);
    return (
      <SlideInView
      style={{width: delWidth}}
        sideStart={Dimensions.get('window').width}
        sideEnd={(Dimensions.get('window').width - delWidth)/2}
        upStart={0}
        upEnd={0}
        duration={this.state.duration}
        slideTop={false}
      >
        <View style={{ width: delWidth, height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35), backgroundColor: 'rgb(255,255,255)' }}>
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
              <Text style={{ flex: 1 }}>{'This is the Drug Delete Screen'}</Text>
              <Text style={{ flex: 1 }}>{'Are you sure you want to delete ' + titleText}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Button
                raised={true}
                containerStyle={{ width: 200, marginTop: 10, marginBottom: 10, marginRight: 25 }}
                icon={{ name: 'ios-arrow-dropright', type: 'ionicon', color: 'white' }}
                iconRight
                backgroundColor={'green'}
                color={'white'}
                title={'Delete'}
                onPress={() => this._handleExitDelete(true)}
              />
              <Button
                raised={true}
                containerStyle={{ width: 200, marginLeft: 25, marginTop: 10, marginBottom: 10, }}
                icon={{ name: 'ios-arrow-dropright', type: 'ionicon', color: 'white' }}
                iconRight
                backgroundColor={'green'}
                color={'white'}
                title={'Cancel'}
                onPress={() => this._handleExitDelete(false)}
              />
            </View>
          </View>
        </View>
      </SlideInView>
    )
  }
}

DrugDelete.propTypes = {
  drugToDelete: PropTypes.object.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(DrugDelete);