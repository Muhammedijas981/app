import * as React from 'react';
import { Dimensions, View } from 'react-native';
import { useDarkMode } from 'react-native-dark-mode';
import { TextField } from 'rn-material-ui-textfield';
import global from '../styles/global';

const OTPTextView = ({ ref, handleTextChange, handleSubmit }) => {
    const isDarkMode = useDarkMode();
    const width = Dimensions.get('window').width;
    return (
        <View style={{ width: width / 2 }}>
            <TextField
                ref={ref}
                label={'Enter OTP'}
                autoFocus={true}
                onChangeText={e => {
                    handleTextChange(e);
                }}
                onSubmitEditing={handleSubmit}
                keyboardType={'number-pad'}
                returnKeyType={'next'}
                textAlign={'center'}
                baseColor={isDarkMode ? 'white' : 'gray'}
                textColor={isDarkMode ? 'white' : 'gray'}
                tintColor={global.accent.color}
                labelTextStyle={{ fontFamily: 'Baloo' }}
                affixTextStyle={{ fontFamily: 'Baloo' }}
                titleTextStyle={{ fontFamily: 'Baloo' }}
                labelOffset={{ x1: 1 }}
                contentInset={{ left: width / 6 }}
                maxLength={6}
            />
        </View>
    );
};

export default OTPTextView;
