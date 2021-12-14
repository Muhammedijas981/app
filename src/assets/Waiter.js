/*
 - Custom waiting animation for TempScan
 - Takes arguments, visible (boolean) and text (string)
 - When using, make sure to keep the length of the text string within the safe limit for the best look across various devices
*/

/*
 Here is a usage example

 const YourScreen = () => {

     let [ waiter, set_waiter ] = React.useState({ visible: false });
     const wait = (text) => text ? set_waiter({ visible: true, text: text }) : set_waiter({ visible: false });

     return(
         <View style={{ flex: 1 }}>
            <Waiter visible={waiter.visible} text={waiter.text} />
        </View>
     );

 }
*/

import * as React from 'react';
import { View, Text, Modal, Dimensions } from 'react-native';
import { useDynamicStyleSheet, DynamicValue, DynamicStyleSheet } from 'react-native-dark-mode';
import CircleSnail from './CircleSnail';
import global from '../styles/global';

const Styles = new DynamicStyleSheet({
    ...global,
    text: {
        color: new DynamicValue('black', 'white'),
        fontFamily: 'Baloo',
    },
});

const Waiter = ({ visible, text }) => {
    const styles = useDynamicStyleSheet(Styles);
    if (text && text.length > 126) console.warn('<Waiter />: The text length exceeds safe limits. It may look bad on some devices.');
    return (
        <Modal
            animationType={'fade'}
            transparent={true}
            statusBarTranslucent={true}
            visible={visible}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View style={{ flex: 6 }} />
                <View style={[styles.prompt_box, { flexDirection: 'row' }]}>
                    <View style={{ flex: 2, justifyContent: 'center', alignItems: 'flex-end' }}>
                        <CircleSnail color={global.accent.color} size={Dimensions.get('window').width / 10} />
                    </View>
                    <View style={{ flex: 0.5 }} />
                    <View style={{ flex: 8, justifyContent: 'center' }}>
                        <Text style={styles.text}>{text}</Text>
                    </View>
                    <View style={{ flex: 0.5 }} />
                </View>
            </View>
        </Modal>
    );
};

export default Waiter;
