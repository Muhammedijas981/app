/*
 - Custom alert box component for TempScan
 - Takes arguments heading, content, labels & onpress callbacks for OK & Cancel buttons
 - When using, make sure to keep the length of your content string within the safe limit for the best look across various devices
 - The labels of the buttons default to OK and Cancel if nothing is provided
*/

/*
 Here is a basic usage example

 const YourScreen = () => {

    let [alert_info, set_alert] = React.useState({ visible: false });
    const alert = (heading, content) => {
        if (!content) set_alert({ visible: false });
        else set_alert({ visible: true, heading: heading, content: content });
    };

    // call alert() whenever you want to display a basic alert box
    alert('Oops', 'Something went wrong. Please try again later');

    return (
        <View style={styles.root}>
            <Alert visible={alert_info.visible} heading={alert_info.heading} content={alert_info.content} onApprove={alert} />
        </View>
    );
 };

 For a more flexible example, refer to the implementation in screens/Settings.js

*/

import * as React from 'react';
import { View, Text, Modal, Dimensions, Pressable } from 'react-native';
import { DynamicStyleSheet, useDynamicStyleSheet, DynamicValue } from 'react-native-dark-mode';
import Icon from 'react-native-vector-icons/Entypo';
import global from '../styles/global';

const Styles = new DynamicStyleSheet({
    ...global,
    heading: {
        fontSize: Dimensions.get('window').width / 20,
        fontFamily: 'Baloo-Bold',
        color: new DynamicValue('black', 'white'),
    },
    content: {
        fontSize: Dimensions.get('window').width / 25,
        color: new DynamicValue('black', 'white'),
        fontFamily: 'Baloo',
    },
    button_text: {
        fontSize: Dimensions.get('window').width / 23,
        fontFamily: 'Baloo-Bold',
    },
});

const Alert = ({ visible, heading, content, cancelLabel, onCancel, approveLabel, onApprove }) => {
    const styles = useDynamicStyleSheet(Styles);
    const Button = ({ text, icon, color, onpress }) => {
        return (
            <Pressable onPress={onpress} style={{ flexDirection: 'row', marginRight: 20 }}>
                <Icon color={color} name={icon} size={25} />
                <Text style={[styles.button_text, { color: color }]}>{text}</Text>
            </Pressable>
        );
    };
    if (!approveLabel) approveLabel = 'OK';
    if (!cancelLabel) cancelLabel = 'Cancel';
    if (content && content.length > 167) console.warn('<Alert />: Content length of alert box exceeds safe limits. It might look bad on some devices');
    return (
        <Modal
            animationType={'slide'}
            transparent={true}
            visible={visible}
            statusBarTranslucent={true}
            onRequestClose={onCancel}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View style={{ flex: 2 }} />
                <View style={styles.prompt_box}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 8, justifyContent: 'flex-end' }}>
                            <Text style={styles.heading}>{heading}</Text>
                        </View>
                        <View style={{ flex: 1 }} />
                    </View>
                    <View style={{ flex: 0.2 }} />
                    <View style={{ flex: 1.8, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 8 }}>
                            <Text style={styles.content}>{content}</Text>
                        </View>
                        <View style={{ flex: 1 }} />
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 8, flexDirection: 'row', justifyContent: 'flex-end' }}>
                            {onCancel ? <Button text={cancelLabel} onpress={onCancel} color={global.error.color} icon={'cross'} /> : null}
                            {onApprove ? <Button text={approveLabel} onpress={onApprove} color={global.accent.color} icon={'check'} /> : null}
                        </View>
                        <View style={{ flex: 1 }} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default Alert;
