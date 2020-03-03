import React from 'react'
import { StyleSheet, Text, View, TouchableHighlight, FlatList, Dimensions, ScrollView, Platform, Dimension } from 'react-native'
import PropTypes from 'prop-types';
import { planBreakdown } from '../../Utils/Api';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import find from 'lodash/find';
import flatMap from 'lodash/flatMap';
import map from 'lodash/map';
import capitalize from 'lodash/capitalize';
import sortBy from 'lodash/sortBy';
import { SlideDots } from '../../Components/SlideDots';

export class pBreakdown extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      trackTheMonths: [],
      trackTheDrugs: [],
      expandedDrug: null,
      expandedMonth: null,
      monthBreakdown: true,
      showPlanInfo: true,
      showDrugInfo: false,
      showMoreDrugDetail: false,
      showNDC: '',
      dotIndex: 0,
      //monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    const { drugList, myPlans, doMailState, startDate, route } = this.props;
    const planSelected = route.params?.planSelected ?? [];

    //console.log('Planbreakdown planSelected.indexOf(myPlans[1].planId) = ', planSelected.indexOf(myPlans[1].planId));

    let currPlan = myPlans.filter((p) => (planSelected.indexOf(p.planId) > -1));
    //console.log('Planbreakdown currPlan = ', currPlan);
    let planData = [];
    currPlan.forEach((cp) => { planData.push({ planId: cp.planId, optMode: cp.optimizeMode, optId: cp.optimized.drugId }) });
    const configData = { drugData: drugList, planData: planData };

    console.log('pBreakdown componentDidMount planSelected = ', planSelected);
    this.props.navigation.setParams({ handleRight: this._handleExit });

    planBreakdown((response) => {
      const { success, payLoad, code, err } = response;
      // console.log('pBreakdown payLoad = ', payLoad);
      this.setState({
        drugDetail: map(payLoad, (r) => r.drugResults),
        dataSourceDrug: map(payLoad, (r) => r.drugResults),
        monthDetail: map(payLoad, (r) => r.monthResults),
        dataSourceMonth: map(payLoad, (r) => r.monthResults),
        planDetail: map(payLoad, (r) => r.planResults),
      });
      // console.log('pBreakdown planDetail = ', map(payLoad, (r) => r.planResults));
    }, JSON.stringify(configData), doMailState, startDate);

  }

  componentWillUnmount() {
    console.log('pBreakdown unmounting');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    console.log('pBreakdown _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  _handleShowMoreDrugDetail = (ndc) => {
    this.setState({
      showMoreDrugDetail: ndc != this.state.showNDC && ndc ? true : !this.state.showMoreDrugDetail,
      showNDC: ndc
    });
  }

  _handleExit = () => {
    const { navigation } = this.props;
    navigation.goBack();
  }

  _handleDrugDetail = () => {
    this.setState({
      showPlanInfo: false,
      showDrugInfo: true
    });
  }

  _handlePlanInfo = () => {
    this.setState({
      showPlanInfo: true,
      showDrugInfo: false,
    });
  }

  _handleMonth = () => {
    this._handleBreakdown(true);
  }

  _handleDrug = () => {
    this._handleBreakdown(false);
  }

  _handleBreakdown = (doMonth) => {
    this.setState({
      monthBreakdown: doMonth,
      showPlanInfo: false,
      showDrugInfo: false
    });
  }

  _handleMonthClick = (monthId) => {
    const { startDate } = this.props;
    const firstMonth = parseInt(startDate.split('/')[0]) - 1;
    if (monthId < firstMonth) {
      return;
    }

    const { monthDetail } = this.state;
    const expandedMonth = this.state.expandedMonth === monthId ? null : monthId;
    let drugTrackingData = [];
    let monthSourceData = [];
    monthDetail.forEach((md) => {
      drugTrackingData.push(sortBy(find(md, (monthInfo) => monthInfo.mId === monthId).trackDrugs, 'drugOrder'));
      monthSourceData.push(md.map((month) => { return { ...month, isExpanded: month.mId === expandedMonth } }));
    })
    //const drugTrackingData = sortBy(find(monthDetail, (monthInfo) => monthInfo.mId === monthId).trackDrugs, 'drugOrder');
    // console.log('drugTrackingData = ' + JSON.stringify(drugTrackingData));
    this.setState({
      dataSourceMonth: monthSourceData,
      expandedMonth,
      trackTheDrugs: drugTrackingData
    });
  }

  _handleDrugClick = (drugId) => {
    console.log('drugId = ' + drugId);
    const { drugDetail } = this.state;
    const expandedDrug = this.state.expandedDrug === drugId ? null : drugId;
    // console.log('expandedDrug = ', expandedDrug);
    let monthlyTrackingData = [];
    let drugSourceData = [];
    drugDetail.forEach((dd) => {
      monthlyTrackingData.push(find(dd, (drugInfo) => drugInfo.dId === drugId).trackMonths);
      drugSourceData.push(dd.map((drug) => { return { ...drug, isExpanded: drug.dId === expandedDrug } }));
    })
    // console.log( 'monthlyTrackingData = ', monthlyTrackingData);
    // console.log( 'drugSourceData = ', drugSourceData);

    this.setState({
      dataSourceDrug: drugSourceData,
      expandedDrug,
      trackTheMonths: monthlyTrackingData
    });
  }

  _renderInnerRowMonth = (info) => {
    //console.log('index = ' + info.index + 'monthItem = ' + JSON.stringify(info.item));
    const { dedCost, initCost, gapCost, catCost, ncCost, drugShort } = info.item;

    const rowText1 = capitalize(drugShort.split(' ')[0]);
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 0, backgroundColor: 'linen', paddingRight: 0 }}>
        <View style={{ width: 85 }}>
          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={{
              fontSize: 11,
              textAlign: 'left',
              paddingLeft: 5
            }}
          >{rowText1}</Text>
        </View>

        <View style={{ flexDirection: 'row', flex: 1 }}>
          <Text style={[styles.mainRowTest, { backgroundColor: 'burlywood' }]}>{dedCost === 0 ? ' ' : '$' + dedCost.toFixed(2)}</Text>

          <Text style={[styles.mainRowTest, { backgroundColor: 'lightskyblue' }]}>{initCost === 0 ? ' ' : '$' + initCost.toFixed(2)}</Text>

          <Text style={[styles.mainRowTest, { backgroundColor: 'peru' }]}>{gapCost === 0 ? ' ' : '$' + gapCost.toFixed(2)}</Text>

          <Text style={[styles.mainRowTest, { backgroundColor: 'darkseagreen' }]}>{catCost === 0 ? ' ' : '$' + catCost.toFixed(2)}</Text>

          <Text style={[styles.mainRowTest, { backgroundColor: 'silver' }]}>{ncCost === 0 ? ' ' : '$' + ncCost.toFixed(2)}</Text>
        </View>
      </View>
    );
  }

  _renderRowMonth = (info, currIndex) => {
    // const { dName, dId, dType, trackMonths, isExpanded } = rowData;
    // console.log('Premium = ' + this.state.planDetail.premium);

    const { mId, dedCost, initCost, gapCost, catCost, ncCost, isExpanded } = info.item;
    const { startDate } = this.props;
    //console.log('_renderRowMonth planYear = ' + planYear);
    const firstMonth = parseInt(startDate.split('/')[0]) - 1;
    if (info.index < firstMonth) {
      return;
    }

    const rowText1 = this.state.monthNames[mId] + " '" + startDate.split('/')[2].slice(-2);

    return (
      <View style={{ flexDirection: 'column', borderTopColor: '#bbb', borderTopWidth: 1 }}>
        <TouchableHighlight
          onPress={() => this._handleMonthClick(mId)}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 0, backgroundColor: 'linen', paddingRight: 0 }}>
            <View style={{ width: 85, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Icon
                name={isExpanded ? 'triangle-down' : 'triangle-right'}
                type={'entypo'}
                color={'black'}
                size={12}
              />
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{ flex: 1, paddingTop: 0, paddingBottom: 0, fontSize: 12, textAlign: 'left', paddingLeft: 2 }}              >{rowText1}</Text>
            </View>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <Text style={[styles.mainRowTest, { backgroundColor: 'burlywood' }]}>{dedCost === 0 ? ' ' : '$' + dedCost.toFixed(2)}</Text>

              <Text style={[styles.mainRowTest, { backgroundColor: 'lightskyblue' }]}>{initCost === 0 ? ' ' : '$' + initCost.toFixed(2)}</Text>

              <Text style={[styles.mainRowTest, { backgroundColor: 'peru' }]}>{gapCost === 0 ? ' ' : '$' + gapCost.toFixed(2)}</Text>

              <Text style={[styles.mainRowTest, { backgroundColor: 'darkseagreen' }]}>{catCost === 0 ? ' ' : '$' + catCost.toFixed(2)}</Text>

              <Text style={[styles.mainRowTest, { backgroundColor: 'silver' }]}>{ncCost === 0 ? ' ' : '$' + ncCost.toFixed(2)}</Text></View>
          </View>
        </TouchableHighlight>
        <View>
          {isExpanded ?
            <FlatList
              data={this.state.trackTheDrugs[currIndex]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={this._renderInnerRowMonth}
            />
            : null}
        </View>
      </View>
    );
  }

  _renderInnerRowDrug = (info) => {
    const { startDate } = this.props;
    const firstMonth = parseInt(startDate.split('/')[0]) - 1;
    if (info.index < firstMonth) {
      return;
    }
    const { dedCost, initCost, gapCost, catCost, ncCost } = info.item;
    // console.log('pBreakdown _renderInnerRowDrug ncCost = ', ncCost);
    const rowText1 = this.state.monthNames[info.index] + " '" + startDate.split('/')[2].slice(-2);
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 0, backgroundColor: 'linen', paddingRight: 0 }}>
        <View style={{ width: 125 }}>
          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={{
              fontSize: 11,
              textAlign: 'left',
              paddingLeft: 25
            }}
          >{rowText1}</Text>
        </View>

        {ncCost === 0 ?
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={[styles.mainRowTest, { backgroundColor: 'burlywood' }]}>{dedCost === 0 ? ' ' : '$' + dedCost.toFixed(2)}</Text>

            <Text style={[styles.mainRowTest, { backgroundColor: 'lightskyblue' }]}>{initCost === 0 ? ' ' : '$' + initCost.toFixed(2)}</Text>

            <Text style={[styles.mainRowTest, { backgroundColor: 'peru' }]}>{gapCost === 0 ? ' ' : '$' + gapCost.toFixed(2)}</Text>

            <Text style={[styles.mainRowTest, { backgroundColor: 'darkseagreen' }]}>{catCost === 0 ? ' ' : '$' + catCost.toFixed(2)}</Text>
          </View>
          :
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={[styles.mainRowTest, { backgroundColor: 'silver' }]}>{'$' + ncCost.toFixed(2)}</Text>
            <Text style={[styles.mainRowTest, { backgroundColor: 'linen' }]}>{' '}</Text>
            <Text style={[styles.mainRowTest, { backgroundColor: 'linen' }]}>{' '}</Text>
            <Text style={[styles.mainRowTest, { backgroundColor: 'linen' }]}>{' '}</Text>
          </View>
        }
      </View>
    );
  }

  _renderRowDrug = (info, currIndex) => {
    // const { dName, dId, dType, trackMonths, isExpanded } = rowData;
    //console.log('index = ' + info.index + ' drugItem = ' + JSON.stringify(info.item));    
    const { dId, dName, dedCost, initCost, gapCost, catCost, ncCost, isExpanded } = info.item;

    const rowText1 = capitalize(dName.split(' ')[0]);

    return (
      <View style={{ flexDirection: 'column', borderTopColor: '#bbb', borderTopWidth: 1 }}>
        <TouchableHighlight
          onPress={() => this._handleDrugClick(dId)}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 0, backgroundColor: 'linen', paddingRight: 0 }}>
            <View style={{ width: 125, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Icon
                name={isExpanded ? 'triangle-down' : 'triangle-right'}
                type={'entypo'}
                color={'black'}
                size={12}
              />
              <Text
                numberOfLines={1}
                ellipsizeMode={'tail'}
                style={{ flex: 1, paddingTop: 0, paddingBottom: 0, fontSize: 12, textAlign: 'left', paddingLeft: 2 }}
              >{rowText1}</Text>
            </View>
            {ncCost === 0 ?
              <View style={{ flexDirection: 'row', flex: 1 }}>
                <Text style={[styles.mainRowTest, { backgroundColor: 'burlywood' }]}>{dedCost === 0 ? ' ' : '$' + dedCost.toFixed(2)}</Text>

                <Text style={[styles.mainRowTest, { backgroundColor: 'lightskyblue' }]}>{initCost === 0 ? ' ' : '$' + initCost.toFixed(2)}</Text>

                <Text style={[styles.mainRowTest, { backgroundColor: 'peru' }]}>{gapCost === 0 ? ' ' : '$' + gapCost.toFixed(2)}</Text>

                <Text style={[styles.mainRowTest, { backgroundColor: 'darkseagreen' }]}>{catCost === 0 ? ' ' : '$' + catCost.toFixed(2)}</Text>
              </View>
              :
              <View style={{ flexDirection: 'row', flex: 1 }}>
                <Text style={[styles.mainRowTest, { backgroundColor: 'silver' }]}>{'$' + ncCost.toFixed(2)}</Text>
                <Text style={[styles.mainRowTest, { backgroundColor: 'linen' }]}>{' '}</Text>
                <Text style={[styles.mainRowTest, { backgroundColor: 'linen' }]}>{' '}</Text>
                <Text style={[styles.mainRowTest, { backgroundColor: 'linen' }]}>{' '}</Text>
              </View>
            }
          </View>
        </TouchableHighlight>
        <View>
          {isExpanded ?
            <FlatList
              data={this.state.trackTheMonths[currIndex]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={this._renderInnerRowDrug}
            />
            : null}
        </View>
      </View>
    );
  }

  _renderRowInfo = (info) => {
    const { label, value } = info.item;
    return (
      <View style={{ flexDirection: 'row', backgroundColor: '#eee', borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
        <Text style={styles.dispLeft}>{label + ':'}</Text>
        <Text style={styles.dispRight}>{value}</Text>
      </View>
    )
  }

  _renderMoreDrugDetail = (item) => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'flexStart', borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
        <Text style={{ width: 200, fontSize: 12, paddingTop: 5, paddingBottom: 5, paddingLeft: 15, paddingRight: 5, color: '#777', backgroundColor: 'rgb(204, 223, 255)', textAlign: 'right' }}>
          {item.label + ':'}
        </Text>
        <Text style={{ flex: 1, fontSize: 12, paddingTop: 5, paddingBottom: 5, paddingLeft: 5, paddingRight: 15, color: '#777', backgroundColor: 'rgb(204, 223, 255)', textAlign: 'left' }}>
          {item.value}
        </Text>
      </View>
    );
  }

  _renderDrug = (item) => {
    const { showMoreDrugDetail, showNDC } = this.state;
    const { dShort, dType, pre90, day90, cost90, gap90, cat90, gapCr90, ncCost, manufacturer } = item;
    const covered = (dType.indexOf('NC') === -1);
    let moredDrugDetails = [];
    let i = 0;
    if (covered) {
      moredDrugDetails.push({ key: (i++).toString(), label: 'Manufacturer', value: manufacturer });
      moredDrugDetails.push({ key: (i++).toString(), label: 'Negotiated price 30 days', value: '$' + (cost90 * 30).toFixed(2) });
      moredDrugDetails.push({ key: (i++).toString(), label: 'Deductible cost 30 days', value: '$' + (pre90 * 30).toFixed(2) });
      moredDrugDetails.push({ key: (i++).toString(), label: 'Initial cost 30 days', value: '$' + (day90 * 30).toFixed(2) });
      moredDrugDetails.push({ key: (i++).toString(), label: 'Cost towards  gap 30 days', value: '$' + (item.cost90 * 30).toFixed(2) });
      moredDrugDetails.push({ key: (i++).toString(), label: 'Gap cost 30 days', value: '$' + (gap90 * 30).toFixed(2) });
      moredDrugDetails.push({ key: (i++).toString(), label: 'Credit towards gap exit 30 days', value: '$' + (gapCr90 * 30).toFixed(2) });
      moredDrugDetails.push({ key: (i++).toString(), label: 'Catastrophic cost 30 days', value: '$' + (cat90 * 30).toFixed(2) });
      moredDrugDetails.push({ key: (i++).toString(), label: 'Drug tier', value: item.tier });
      moredDrugDetails.push({ key: (i++).toString(), label: 'Deductible applied', value: item.dedApplies ? 'yes' : 'no' });
      moredDrugDetails.push({ key: (i++).toString(), label: 'Gap coverage available', value: item.gapCoverage ? 'yes' : 'no' });
      moredDrugDetails.push({ key: (i++).toString(), label: 'Step therapy required', value: item.stepped ? 'yes' : 'no' });
      moredDrugDetails.push({ key: (i++).toString(), label: 'Prior authorization required', value: item.authorize ? 'yes' : 'no' });
      moredDrugDetails.push({ key: (i++).toString(), label: 'Dosage limit set', value: item.hasLimit ? item.limitAmt + '/' + item.limitAmt + ' days' : 'no' });
    }
    else {
      moredDrugDetails.push({ key: (i++).toString(), label: 'Drug not covered, market price 30 days', value: '$' + (ncCost / 12).toFixed(2) });
    }

    return (
      <View style={{ flex: 1, flexDirection: 'column', backgroundColor: 'rgb(183, 211, 255)' }}>
        {/* <Text style={styles.dispLeft}>{'Sample text goes here'}</Text>
        <Text style={styles.dispRight}>{'Sample text goes here'}</Text> */}

        <TouchableHighlight
          onPress={covered ? () => this._handleShowMoreDrugDetail(item.ndc) : null}
        >
          <View style={{ flexDirection: 'row', alignContent: 'center', backgroundColor: 'rgb(183, 211, 255)' }}>
            <Icon
              name={showMoreDrugDetail && (showNDC === item.ndc) && covered ? 'triangle-down' : 'triangle-right'}
              type={'entypo'}
              color={covered ? 'black' : 'grey'}
              size={20}
              containerStyle={{
                paddingLeft: 15,
                paddingRight: 5,
                backgroundColor: 'rgb(183, 211, 255)',
              }}
            />
            <Text style={{ flex: 1, fontSize: 14, backgroundColor: 'rgb(183, 211, 255)', textAlign: 'left', paddingTop: 5, paddingBottom: 5, paddingRight: 10 }}>
              {dShort}</Text>
          </View>
        </TouchableHighlight>
        {showMoreDrugDetail && (showNDC === item.ndc) ?
          <View>
            <FlatList
              data={moredDrugDetails}
              renderItem={({ item }) => this._renderMoreDrugDetail(item)}
            />
          </View>
          :
          <Text style={{ fontSize: 12, paddingTop: 5, paddingBottom: 5, paddingLeft: 20, paddingRight: 15, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
            {!covered ? 'Drug not covered, 30 day market price $' + (ncCost / 12).toFixed(2) : 'Ded $' + (pre90 * 30).toFixed(2) + ', init $' + (day90 * 30).toFixed(2) + ' gap $' + (gap90 * 30).toFixed(2) + ', cat $' + (cat90 * 30).toFixed(2)}</Text>
        }
      </View>
    );
  }

  _getItemLayout = (data, index) => (
    { length: Dimensions.get('window').width, offset: Dimensions.get('window').width * index, index }
  )

  _onScrollEnd = (e) => {
    let contentOffset = e.nativeEvent.contentOffset;
    // let viewSize = e.nativeEvent.layoutMeasurement;

    // Divide the horizontal offset by the width of the view to see which page is visible
    let pageNum = Math.floor(contentOffset.x / this.props.windowWidth);
    this.setState({
      dotIndex: pageNum,
    })
    // console.log('scrolled to page ', pageNum);
  }

  _renderContent(currPlan, index) {
    //const { currPlan } = this.props;
    // console.log('pBreakdown _renderContent index = ', index, ', currPlan = ', currPlan);

    const { monthBreakdown, planDetail, showPlanInfo, drugDetail, showDrugInfo, dataSourceMonth, dataSourceDrug, flag, adjust } = this.state;
    const currplanDetail = planDetail[index];
    // console.log('pBreakdown _renderContent currplanDetail = ', currplanDetail);
    const currdrugDetail = sortBy(drugDetail[index], 'dShort');
    const currdataSourceMonth = dataSourceMonth[index];
    const currdataSourceDrug = dataSourceDrug[index];

    // console.log('PlanBreakdown costs = ', Math.max(...flatMap(currdataSourceDrug.trackMonths, (x) => (x.dedCost + x.initCost + x.gapCost + x.catCost + x.ncCost))));

    // const monthMax = (this.props.windowWidth - 100) / (Math.max(...flatMap(currdataSourceMonth.trackDrugs, (x) => (x.dedCost + x.initCost + x.gapCost + x.catCost + x.ncCost))) + currplanDetail.premium) / 1.1;
    // const drugMax = (this.props.windowWidth - 100) / Math.max(...flatMap(currdataSourceDrug.trackMonths, (x) => (x.dedCost + x.initCost + x.gapCost + x.catCost + x.ncCost))) / 1.1;
    // console.log('PlanBreakdown _renderContent currplanDetail = ', currplanDetail, ', currdrugDetail = ', currdrugDetail, ', currdataSourceMonth = ', currdataSourceMonth, ', currdataSourceDrug = ', currdataSourceDrug, ', index = ', index, ', monthMax = ', monthMax, ', drugMax = ', drugMax);
    // console.log('PlanBreakdown _renderContent index = ', index, ', monthMax = ', monthMax, ', drugMax = ', drugMax);
    const { doMailState, startDate } = this.props;
    if (!currplanDetail) { return null; }
    const planMonths = 13 - startDate.split('/')[0];
    let planDetailArray = [];
    let i = 0;
    if (currPlan.compDrugId > 0) {
      planDetailArray.push({ key: (i++).toString(), label: 'Optimized for', value: currPlan.compDrugName })
    }
    planDetailArray.push({ key: (i++).toString(), label: 'Start date', value: startDate });
    planDetailArray.push({ key: (i++).toString(), label: 'Use mail order', value: doMailState ? 'yes' : 'no' });
    planDetailArray.push({ key: (i++).toString(), label: 'Total plan cost', value: '$' + currplanDetail.totalCost.toFixed(2) });
    planDetailArray.push({ key: (i++).toString(), label: 'Monthly Premium', value: '$' + currplanDetail.premium.toFixed(2) });
    planDetailArray.push({ key: (i++).toString(), label: 'Annual premium', value: '$' + (currplanDetail.premium * planMonths).toFixed(2) });
    planDetailArray.push({ key: (i++).toString(), label: 'Deductible', value: currplanDetail.deductible === 0 ? 'none' : '$' + currplanDetail.deductible.toFixed(2) });
    planDetailArray.push({ key: (i++).toString(), label: 'Maintenance drugs', value: '$' + (currplanDetail.maintenanceCost).toFixed(2) });
    planDetailArray.push({ key: (i++).toString(), label: 'Acute drugs', value: '$' + currplanDetail.acuteCost.toFixed(2) });
    planDetailArray.push({ key: (i++).toString(), label: 'Not covered', value: '$' + currplanDetail.notCovered.toFixed(2) });
    planDetailArray.push({ key: (i++).toString(), label: 'Deductible met on', value: currplanDetail.deductible === 0 ? 'no deductible' : currplanDetail.dedDate });
    planDetailArray.push({ key: (i++).toString(), label: 'Reached Gap on', value: currplanDetail.gapCost === 0 ? 'not reached' : currplanDetail.gapDate });
    planDetailArray.push({ key: (i++).toString(), label: 'Reached Cat on', value: currplanDetail.catCost === 0 ? 'not reached' : currplanDetail.catDate });
    planDetailArray.push({ key: (i++).toString(), label: 'Deductible cost', value: '$' + currplanDetail.dedCost.toFixed(2) });
    planDetailArray.push({ key: (i++).toString(), label: 'Initial cost', value: '$' + currplanDetail.initCost.toFixed(2) });
    planDetailArray.push({ key: (i++).toString(), label: 'To gap cost', value: '$' + currplanDetail.toGapCost.toFixed(2) });
    planDetailArray.push({ key: (i++).toString(), label: 'Gap cost', value: '$' + currplanDetail.gapCost.toFixed(2) });
    planDetailArray.push({ key: (i++).toString(), label: 'Gap credit', value: '$' + currplanDetail.gapCredit.toFixed(2) });
    planDetailArray.push({ key: (i++).toString(), label: 'Catastrophic cost', value: '$' + currplanDetail.catCost.toFixed(2) });
    // console.log('planDetailArray = ' + JSON.stringify(planDetailArray));

    return (

      <View style={{ flex: 1, flexDirection: 'column', borderWidth: 0, borderColor: 'red' }}>
        <View style={{ backgroundColor: '#ddd', borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
          <Text style={{ fontSize: 14, color: 'black', textAlign: 'center', paddingLeft: 5, paddingTop: 5, paddingBottom: 5 }}>
            {currplanDetail.planName}
          </Text>
        </View>
        {showPlanInfo &&
          <FlatList
            data={planDetailArray}
            initialNumToRender={20}
            horizontal={false}
            extraData={{ flag }}
            keyExtractor={(item) => item.key.toString()}
            renderItem={this._renderRowInfo}
          />
        }
        {showDrugInfo &&
          <FlatList
            data={currdrugDetail}
            initialNumToRender={20}
            horizontal={false}
            extraData={flag}
            keyExtractor={(item) => item.ndc.toString()}
            renderItem={({ item }) => this._renderDrug(item)}
          />
        }
        {(!showPlanInfo && !showDrugInfo) &&
          <View style={{ flex: 1 }}>
            {!monthBreakdown &&
              <View style={{ backgroundColor: 'linen', borderBottomColor: 'black', borderBottomWidth: 2, borderTopColor: 'black', borderTopWidth: 2 }}>
                <View style={styles.phaseView}>
                  <Text style={[styles.phaseHeader, { width: 125, backgroundColor: 'silver' }]}>{'NC'}</Text>
                  <Text style={[styles.phaseHeader, { flex: 1, backgroundColor: 'burlywood' }]}>{'Ded'}</Text>
                  <Text style={[styles.phaseHeader, { flex: 1, backgroundColor: 'lightskyblue' }]}>{'Init'}</Text>
                  <Text style={[styles.phaseHeader, { flex: 1, backgroundColor: 'peru' }]}>{'Gap'}</Text>
                  <Text style={[styles.phaseHeader, { flex: 1, backgroundColor: 'darkseagreen' }]}>{'Cat'}</Text>
                </View>
                <View style={styles.tableView}>
                  <Text style={[styles.colItem, { width: 125, backgroundColor: 'silver' }]}>{(currplanDetail.notCovered === 0 ? ' ' : '$' + currplanDetail.notCovered.toFixed(2))}</Text>
                  <Text style={[styles.colItem, { flex: 1, backgroundColor: 'burlywood' }]}>{currplanDetail.dedCost === 0 ? ' ' : '$' + currplanDetail.dedCost.toFixed(2)}</Text>
                  <Text style={[styles.colItem, { flex: 1, backgroundColor: 'lightskyblue' }]}>{currplanDetail.initCost === 0 ? ' ' : '$' + (currplanDetail.initCost).toFixed(2)}</Text>
                  <Text style={[styles.colItem, { flex: 1, backgroundColor: 'peru' }]}>{currplanDetail.gapCost === 0 ? ' ' : '$' + (currplanDetail.gapCost).toFixed(2)}</Text>
                  <Text style={[styles.colItem, { flex: 1, backgroundColor: 'darkseagreen' }]}>{currplanDetail.catCost === 0 ? ' ' : '$' + (currplanDetail.catCost).toFixed(2)}</Text>
                </View>
              </View>
            }
            {monthBreakdown &&
              <View style={{ backgroundColor: 'linen', borderBottomColor: 'black', borderBottomWidth: 1, borderTopColor: 'black', borderTopWidth: 1 }}>
                <View style={styles.phaseView}>
                  <Text style={[styles.phaseHeader, { width: 85, backgroundColor: 'dodgerblue' }]}>{'Prem'}</Text>
                  <Text style={[styles.phaseHeader, { flex: 1, backgroundColor: 'burlywood' }]}>{'Ded'}</Text>
                  <Text style={[styles.phaseHeader, { flex: 1, backgroundColor: 'lightskyblue' }]}>{'Init'}</Text>
                  <Text style={[styles.phaseHeader, { flex: 1, backgroundColor: 'peru' }]}>{'Gap'}</Text>
                  <Text style={[styles.phaseHeader, { flex: 1, backgroundColor: 'darkseagreen' }]}>{'Cat'}</Text>
                  <Text style={[styles.phaseHeader, { flex: 1, backgroundColor: 'silver' }]}>{'NC'}</Text>
                </View>
                <View style={styles.tableView}>
                  <Text style={[styles.colItem, { width: 85, backgroundColor: 'dodgerblue' }]}>{'$' + (currplanDetail.premium * planMonths).toFixed(2)}</Text>
                  <Text style={[styles.colItem, { flex: 1, backgroundColor: 'burlywood' }]}>{currplanDetail.dedCost === 0 ? '' : '$' + currplanDetail.dedCost.toFixed(2)}</Text>
                  <Text style={[styles.colItem, { flex: 1, backgroundColor: 'lightskyblue' }]}>{currplanDetail.initCost === 0 ? '' : '$' + (currplanDetail.initCost).toFixed(2)}</Text>
                  <Text style={[styles.colItem, { flex: 1, backgroundColor: 'peru' }]}>{currplanDetail.gapCost === 0 ? '' : '$' + (currplanDetail.gapCost).toFixed(2)}</Text>
                  <Text style={[styles.colItem, { flex: 1, backgroundColor: 'darkseagreen' }]}>{currplanDetail.catCost === 0 ? '' : '$' + (currplanDetail.catCost).toFixed(2)}</Text>
                  <Text style={[styles.colItem, { flex: 1, backgroundColor: 'silver' }]}>{(currplanDetail.notCovered === 0 ? '' : '$' + currplanDetail.notCovered.toFixed(2))}</Text>
                </View>
              </View>
            }
            <FlatList
              contentContainerStyle={{ borderBottomColor: 'black', borderBottomWidth: 2 }}
              data={monthBreakdown ? currdataSourceMonth : currdataSourceDrug}
              extraData={flag}
              keyExtractor={monthBreakdown ? (item) => item.mId.toString() : (item) => item.dId.toString()}
              renderItem={monthBreakdown ? (info) => this._renderRowMonth(info, index) : (info) => this._renderRowDrug(info, index)}
            />
          </View>
        }
      </View>
    );
  }

  render() {
    const { adjust, monthBreakdown, showPlanInfo, planDetail, showDrugInfo, flag, dotIndex } = this.state;
    console.log('pBreakdown render');
    const { route, myPlans } = this.props;
    const planSelected = route.params?.planSelected ?? [];
    const currPlan = myPlans.filter((p) => planSelected.indexOf(p.planId) > -1);
    //console.log('pBreakdown render currPlan = ', currPlan);
    if (!planDetail) { return null; }

    return (
      <View style={{ flexDirection: 'column', justifyContent: 'flex-start', height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <View style={[styles.topTab]}>
          <TouchableHighlight
            onPress={this._handleDrugDetail}
          >
            <View style={{ flexDirection: 'column' }}>
              <Icon
                name={'local-pharmacy'}
                type={'material'}
                color={showDrugInfo ? '#7c75ff' : '#aaa'}
                size={20}
              />
              <Text style={[styles.topTabText, { color: showDrugInfo ? '#7c75ff' : '#aaa' }]}>
                {'Rx Detail'}
              </Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={this._handlePlanInfo}
          >
            <View style={{ flexDirection: 'column' }}>
              <Icon
                name={'info-outline'}
                type={'material'}
                color={showPlanInfo ? '#7c75ff' : '#aaa'}
                size={20}
              />
              <Text style={[styles.topTabText, { color: showPlanInfo ? '#7c75ff' : '#aaa' }]}>
                {'Plan Info'}
              </Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={this._handleDrug}
          >
            <View style={{ flexDirection: 'column' }}>
              <Icon
                name='pill'
                type={'material-community'}
                color={!monthBreakdown && !showPlanInfo && !showDrugInfo ? '#7c75ff' : '#aaa'}
                size={20}
              />
              <Text style={[styles.topTabText, { color: !monthBreakdown && !showPlanInfo && !showDrugInfo ? '#7c75ff' : '#aaa' }]}>
                {'By Drug'}
              </Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={this._handleMonth}
          >
            <View style={{ flexDirection: 'column' }}>
              <Icon
                name='calendar'
                type={'material-community'}
                color={monthBreakdown && !showPlanInfo && !showDrugInfo ? '#7c75ff' : '#aaa'}
                size={20}
              />
              <Text style={[styles.topTabText, { color: monthBreakdown && !showPlanInfo && !showDrugInfo ? '#7c75ff' : '#aaa' }]}>
                {'By Month'}
              </Text>
            </View>
          </TouchableHighlight>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', borderWidth: 0, borderColor: 'blue' }}>
          {this._renderContent(currPlan, 0)}
          {/* <FlatList
            contentStyle={{ flex: 1 }}
            data={currPlan}
            horizontal={true}
            pagingEnabled={true}
            extraData={{ flag }}
            keyExtractor={(item) => item.planId.toString()}
            getItemLayout={this._getItemLayout}
            renderItem={({ item, index }) => this._renderContent(item, index)}
            onMomentumScrollEnd={this._onScrollEnd}
          /> */}
        </View>
      </View >)
  }
}

pBreakdown.propTypes = {
  compCount: PropTypes.number.isRequired,
  comparePlans: PropTypes.array.isRequired,
  doMailState: PropTypes.bool.isRequired,
  drugList: PropTypes.array.isRequired,
  myPlans: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  startDate: PropTypes.string.isRequired,
  windowWidth: PropTypes.number.isRequired,
};


const mapStateToProps = (state) => {
  return {
    doMailState: state.flowState['doMailState'],
    startDate: state.flowState['startDate'] ? state.flowState['startDate'] : new Date().toLocaleDateString('en-US'),
    drugList: flatMap(state.myDrugs, (d) => d.configDetail),
    myPlans: sortBy(state.myPlans, 'totalCost'),
    comparePlans: state.comparePlans,
    compCount: state.comparePlans.length,
    windowWidth: state.platform['WindowWidth'] ? state.platform['WindowWidth'] / state.platform['PixelRatio'] : 0,
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(pBreakdown);

const styles = StyleSheet.create({
  phaseView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingRight: 0,
    paddingLeft: 0,
    // paddingTop: 3,
    // paddingBottom: 3,
    backgroundColor: 'linen',
    borderBottomColor: 'linen',
    borderBottomWidth: 1,
  },
  phaseHeader: {
    // flex: 1,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 3,
    paddingRight: 3,
    fontSize: 12,
    textAlign: 'center',
    borderColor: 'black',
    borderWidth: 0,
    //backgroundColor: 'rgba(64, 92, 232, 0.75)'
  },
  tableView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingRight: 0,
    paddingLeft: 0,
    //paddingRight: 5,
  },
  dispLeft: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 5,
  },
  dispRight: {
    flex: 1,
    textAlign: 'left',
    fontSize: 14,
    paddingLeft: 5,
    paddingTop: 5,
    paddingBottom: 5,
  },
  topTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 3,
    paddingBottom: 3,
    backgroundColor: '#f2f2f2',
    borderTopWidth: 1,
    borderTopColor: '#e2e2e2',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e2e2',
    // borderColor: 'green',
    // borderWidth: 3,
  },
  topTabText: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#7c75ff',
    paddingTop: 2,
  },
  colItem: {
    // flex: 1,
    paddingTop: 2,
    paddingBottom: 2,
    paddingRight: 3,
    fontSize: 10,
    // color: '#555',
    // borderColor: '#bbb',
    // borderWidth: 1,
    textAlign: 'right',
    backgroundColor: 'linen'
  },
  mainRowTest: {
    flex: 1,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 0,
    fontSize: 10,
    paddingRight: 3,
    textAlign: 'right'
  }
})
