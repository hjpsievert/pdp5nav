import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';

//import { connect } from 'react-redux';

export class SlideDots extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
        }
    }

    render() {
        const { numDots, currIndex } = this.props;
        let iconArray = [];
        let i;
        for (i = 0; i <= numDots; i++) {
            iconArray.push(i === currIndex ? { key: i, color: '#999' } : { key: i, color: '#ddd' });
        }
        let dotIcons;
        dotIcons = iconArray.map((s) => {
            return <Icon name={'brightness-1'} type={'material'} color={s.color} size={12} containerStyle={styles.iconStyle} key={s.key} />
        });
        return (
            <View style={styles.mainView}>
                {dotIcons}
            </View>
        );
    }
}

SlideDots.propTypes = {
    currIndex: PropTypes.number.isRequired,
    numDots: PropTypes.number.isRequired,
};

const styles = StyleSheet.create({
    mainView: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 25, width: Dimensions.get('window').width, backgroundColor: '#fff'
    },
    iconStyle: {
        paddingLeft: 3,
        paddingRight: 3,
    }
});