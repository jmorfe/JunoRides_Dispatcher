import React, {useState, useEffect} from 'react';
import {Platform, View, Image, Text, Keyboard} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useSelector} from 'react-redux';
import GradientButton from '../../../Components/GradientButton';
import {loaderOne} from '../../../Components/Loaders/AnimatedLoaderFiles';
import WrapperContainer from '../../../Components/WrapperContainer';
import imagePath from '../../../constants/imagePath';
import strings from '../../../constants/lang';
import navigationStrings from '../../../navigation/navigationStrings';
import actions from '../../../redux/actions';
import colors from '../../../styles/colors';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  width,
} from '../../../styles/responsiveSize';
import {
  otpTimerCounter,
  showError,
  showSuccess,
} from '../../../utils/helperFunctions';
import validator from '../../../utils/validations';
import stylesFunction from './styles';
import PhoneNumberInput from '../../../Components/PhoneNumberInput';
import Header from '../../../Components/Header';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import fontFamily from '../../../styles/fontFamily';
import {getItem, setUserData} from '../../../utils/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {requestUserPermission} from '../../../utils/notificationServices';
import RNOtpVerify from 'react-native-otp-verify';
import useInterval from '../../../utils/useInterval';
import {clockRunning} from 'react-native-reanimated';
import { saveUserData, setAttributeFormInfo } from '../../../redux/actions/auth';

export default function PhoneVerification({navigation, route}) {
  const paramData = route?.params?.data;
  console.log(paramData, 'paramData');
  const [state, setState] = useState({
    isLoading: false,
    callingCode: paramData?.callingCode ? paramData?.callingCode : '91',
    cca2: paramData?.cca2 ? paramData?.cca2 : 'IN',
    phoneNumber: paramData?.phoneNumber,
    otp: '87124',
    otpToShow: '',
    otpPrefilled: false,
    otpTimer: 15,
  });

  const {
    isLoading,
    callingCode,
    cca2,
    phoneNumber,
    otp,
    otpToShow,
    otpPrefilled,
    otpTimer,
  } = state;
  //   const fontFamily = appStyle?.fontSizeData;
  const {themeColors} = useSelector(state => state?.initBoot);
  const clientInfo = useSelector(state => state?.initBoot?.clientInfo);
  const fcmToken = useSelector(state => state?.initBoot?.fcmToken);

  //Update states
  const updateState = data => setState(state => ({...state, ...data}));
  //Styles in app
  const defaultLanguagae = useSelector(
    state => state?.initBoot?.defaultLanguage,
  );

  const styles = stylesFunction({defaultLanguagae});
  //all states used in this screen

  //Naviagtion to specific screen
  const moveToNewScreen = (screenName, data) => () => {
    navigation.navigate(screenName, {data});
  };
  //On change textinput
  const _onChangeText = key => val => {
    updateState({[key]: val});
  };

  //Validate form
  const isValidData = () => {
    const error = validator({phoneNumber});
    if (error) {
      showError(error);
      return;
    }
    return true;
  };

  useEffect(() => {
    let timerId;
    if (otpTimer > 0) {
      timerId = setTimeout(() => {
        updateState({otpTimer: otpTimer - 1});
      }, 1000);
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [otpTimer]);

  const otpHandler = message => {
    console.log(message, 'complete msg>>>');
    if (!!message) {
      let msgOTP = message.replace(/[^0-9]/g, '');
      let OTP = msgOTP.substring(0, 6);

      updateState({
        otpToShow: OTP,
        otp: OTP,
      });

      if (otp.length === 6) {
        verfifyAccount();
      }
    }
    RNOtpVerify.removeListener();
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      RNOtpVerify.getOtp()
        .then(res => {
          RNOtpVerify.addListener(otpHandler);
        })
        .catch(error => console.log(error, 'error>>>>'));
      return () => {
        RNOtpVerify.removeListener();
      };
    }
  }, []);

  useEffect(() => {
    if (otp && otpPrefilled) {
      updateState({isLoading: false});
    }
  }, [otp, otpPrefilled]);

  //Opt input function
  const onOtpInput = code => {
    updateState({
      isLoading: true,
      otp: code,
      otpPrefilled: true,
    });

    // (() => {

    // })();
    // console.log(code,"123");
    // if(code?.length == 6){
    //   console.log(code,"1234");
    //   verfifyAccount(code);
    // }
  };

  // //Code input
  useEffect(() => {
    if (otp.length === 6) {
      verfifyAccount();
    }
  }, [otp]);
  // console.log(otp,'otpotp')
  //VerifyAccount
  const verfifyAccount = async () => {
    let data = {};
    data['phone_number'] = `${paramData?.phone_number}`;
    data['otp'] = otp;
    data['device_token'] = !!fcmToken ? fcmToken : '12345689';
    data['device_type'] = Platform.OS;
    console.log(data, 'data>>>data>data>data');
    updateState({isLoading: true});
    actions
      .verifyAccount(data, {client: clientInfo?.database_name})
      .then(res => {
        console.log(res, 'verifyAccountverifyAccount');
        updateState({isLoading: false});
        setTimeout(() => {
          setAttributeFormInfo(res?.data?.attribute_form);
          setUserData(res.data).then(suc => {
            saveUserData(res.data);
          });
        }, 400);
      })
      .catch(errorMethod);
  };

  const _resendCode = () => {
    let data = {};
    data['phone_number'] = `${paramData?.phone_number}`;
    updateState({isLoading: true});
    actions
      .login(data, {client: clientInfo?.database_name})
      .then(res => {
        updateState({isLoading: false});
        if (res?.data) {
          showSuccess('Otp send successfuly');
          updateState({
            otpTimer: 15,
          });
        }
      })
      .catch(errorMethod);
  };

  //Error handling in api
  const errorMethod = error => {
    updateState({isLoading: false, otpToShow: ''});

    console.log(error, 'errorerror');

    showError(error?.message || error?.error);
  };

  return (
    <WrapperContainer
      isLoadingB={isLoading}
      source={loaderOne}
      statusBarColor={colors.white}
      bgColor={colors.white}>
      <Header
        leftIcon={imagePath.backArrow}
        // centerTitle={title}
        headerStyle={{backgroundColor: colors.white}}
      />
      {/* <View style={{height: moderateScaleVertical(28)}} /> */}
      <View
        style={{
          flex: 1,
          marginHorizontal: 20,
          marginTop: moderateScaleVertical(30),
        }}>
        <Text style={styles.verification}>{strings.VERIFICATION}</Text>
        <Text
          style={
            styles.codesendto
          }>{`${strings.CODESENTTO} ${paramData?.phone_number}`}</Text>

        <SmoothPinCodeInput
          containerStyle={{alignSelf: 'center'}}
          password
          autoFocus={true}
          mask={<View style={styles.maskStyle} />}
          cellSize={width / 8}
          codeLength={6}
          cellSpacing={10}
          editable={true}
          cellStyle={styles.cellStyle}
          cellStyleFocused={styles.cellStyleFocused}
          textStyle={styles.textStyleCodeInput}
          textStyleFocused={styles.textStyleFocused}
          inputProps={{
            autoCapitalize: 'none',
            autoFocus: true,
          }}
          value={otpToShow}
          keyboardType={'numeric'}
          onTextChange={otpToShow => updateState({otpToShow})}
          onFulfill={code => onOtpInput(code)}
        />
        <Text style={styles.didntgetOtp}>
          {`${strings.DIDNTRECIEVEANYCODE}`}
          <Text
            onPress={otpTimer > 0 ? () => {} : _resendCode}
            style={{
              color: colors.themeColor,
              fontFamily: fontFamily.bold,
            }}>
            {otpTimer > 0
              ? otpTimerCounter(otpTimer)
              : `${strings?.RESENTCODE}`}
          </Text>
        </Text>
      </View>
    </WrapperContainer>
  );
}
