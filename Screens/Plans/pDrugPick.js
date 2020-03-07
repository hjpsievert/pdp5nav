import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableHighlight,
  Dimensions,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Dispatch from '../../Redux/Dispatches';
import { Icon } from 'react-native-elements';

export class pDrugPick extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      dataSource: props.searchResults,
    };
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    this.setState({
      dataSource: this.props.searchResults,
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.searchResults != this.props.searchResults) {
      this.setState({
        dataSource: this.props.searchResults,
      });
    }
    console.log('pDrugPick componentDidUpdate');
  }

componentWillUnmount() {
    console.log('pDrugPick will unmount');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    console.log('pDrugPick _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  _handleBaseDrugSelectionComplete = () => {
    const { navigation, selectionCount } = this.props;
    if (selectionCount > 0) {
      navigation.navigate('pDrugSelect');
    }
    else {
      navigation.navigate('pDrugSearch');
    }
  }

  _renderBaseDrug = (item) => {
    const { handleBaseDrugClick } = this.props;
    const { baseName, drugCount, isSelected } = item;
    console.log('pDrugPick _renderBaseDrug baseName = ', baseName, ', selected = ', isSelected)
    const theTitle = baseName + '(' + drugCount + ')';
    return (
      <TouchableHighlight
        onPress={() => handleBaseDrugClick(item)}
      >
        <View style={{ flexDirection: 'row', alignContent: 'center', backgroundColor: 'rgb(183, 211, 255)', borderBottomWidth: 1, borderBottomColor: '#bbb' }}>
          <Icon
            name={isSelected ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
            type={'material-community'}
            color={'black'}
            size={18}
            containerStyle={{
              paddingLeft: 15,
              paddingRight: 10,
              paddingTop: 10,
              backgroundColor: 'rgb(183, 211, 255)',
            }}
          />
          <Text style={{ flex: 1, fontSize: 14, backgroundColor: 'rgb(183, 211, 255)', textAlign: 'left', paddingTop: 10, paddingBottom: 10 }}>
            {theTitle}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }

render() {
  const {adjust} = this.state;
    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35), flexDirection: 'column', alignItems: 'stretch' }} >
          <View style={{ flex: 1, borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
            <FlatList
              data={this.state.dataSource}
              extraData={adjust}
              keyExtractor={(item) => item.baseId.toString()}
              renderItem={({ item }) => this._renderBaseDrug(item)}
            />
          </View>

        </View>)
  }

}

pDrugPick.propTypes = {
  handleBaseDrugClick: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  searchResults: PropTypes.array.isRequired,
  selectionCount: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => {
  return {
    searchResults: state.searchResults,
    selectionCount: state.searchResults.filter((r) => r.isSelected).map((r) => r.baseId).length,
  }
}

const mapDispatchToProps = {
  handleBaseDrugClick: Dispatch.handleBaseDrugClick,
}

export default connect(mapStateToProps, mapDispatchToProps)(pDrugPick);

