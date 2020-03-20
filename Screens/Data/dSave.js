import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Dimensions,
  Platform,
  Keyboard
} from 'react-native';
import { saveDrugList } from '../../Utils/SaveData';
import { Icon, Input } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Dispatch from '../../Redux/Dispatches';
import flatMap from 'lodash/flatMap';

export class dSave extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      inputTitle: '',
      inputDescription: '',
      inputCategory: '',
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);

  }

  componentDidUpdate(prevProps, prevState) {
    console.log('dSave didUpdate');
  }

  componentWillUnmount() {
    console.log('dSave did unmount');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    // console.log('dSave _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }


  _empty = () => {
  }

  _saveTitle = (title) => {
    this.setState({
      inputTitle: title,
    })
  }

  _saveDescription = (description) => {
    this.setState({
      inputDescription: description,
    })
  }

  _saveCategory = (category) => {
    this.setState({
      inputCategory: category,
    })
  }

  _savePlanDrugList = () => {
    const { inputTitle, inputDescription, inputCategory } = this.state;
    const { userProfile, myDrugs } = this.props;
    saveDrugList(this._handleExit, userProfile, inputTitle.trim(), inputDescription.trim(), inputCategory.trim(), myDrugs, 'savedPlanDrugs')
  }

  _handleExit = () => {
    this.props.navigation.navigate('dmMain');
  }

  render() {
    const { adjust } = this.state;
    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <View style={{
          flexDirection: 'column', paddingHorizontal: 15, flex: 1
        }}
        >
          <View style={{ paddingHorizontal: 10, paddingTop: 10, paddingBottom: 25 }}>
            <Input
              containerStyle={{ marginTop: 10 }}
              labelStyle={{ fontSize: 16 }}
              inputStyle={{ fontSize: 14 }}
              errorStyle={{ fontSize: 14 }}
              label={'Title'}
              placeholder={'Enter a short title ...'}
              onChangeText={this._saveTitle}
            />
            <Input
              containerStyle={{ marginTop: 10 }}
              labelStyle={{ fontSize: 16 }}
              inputStyle={{ fontSize: 14 }}
              errorStyle={{ fontSize: 14 }}
              label={'Category'}
              placeholder={'Enter a short category ...'}
              onChangeText={this._saveCategory}
            />
            <Input
              containerStyle={{ marginTop: 10 }}
              labelStyle={{ fontSize: 16 }}
              inputStyle={{ fontSize: 14 }}
              errorStyle={{ fontSize: 14 }}
              label={'Description'}
              placeholder={'Enter a description ...'}
              onChangeText={this._saveDescription}
              onEndEditing={Keyboard.dismiss}
              numberOfLines={3}
            />
          </View>
          <View style={{
            marginTop: 10,
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: 3,
            backgroundColor: 'rgb(183, 211, 255)',
            borderBottomWidth: 1,
            borderBottomColor: 'black',
            borderTopWidth: 1,
            borderTopColor: 'black'
          }}
          >
<TouchableHighlight
              onPress={this._savePlanDrugList}
            >
              <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                <Icon
                  name={'content-save-outline'}
                  type={'material-community'}
                  color={'black'}
                  size={25}
                  containerStyle={{
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}
                />
                <Text
                  style={[styles.topTabText, { color: 'black' }]}
                >
                  {'SAVE'}
                </Text>
              </View>
            </TouchableHighlight>

          </View>
        </View>
      </View>)
  }
}

dSave.propTypes = {
  //drugCount: PropTypes.number.isRequired,
  myDrugs: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  userProfile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    myDrugs: flatMap(state.myDrugs, (d) => d),
    //drugCount: size(state.myDrugs),
    userProfile: state.profile,
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(dSave);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
