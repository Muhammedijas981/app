import * as React from 'react';
import { View, Text, Modal, Pressable, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { DynamicStyleSheet, DynamicValue, useDynamicStyleSheet } from 'react-native-dark-mode';
import global from '../styles/global';

const width = Dimensions.get('window').width;
const Styles = new DynamicStyleSheet({
    ...global,
    box: {
        width: width / 1.2,
        height: 56,
        borderColor: new DynamicValue('black', 'white'),
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: 'center',
    },
    box_label: {
        color: new DynamicValue('black', 'white'),
        fontFamily: 'Baloo',
        fontSize: 16,
        marginLeft: 10,
    },
    heading: {
        color: new DynamicValue('black', 'white'),
        fontFamily: 'Baloo-Bold',
        fontSize: width / 20,
    },
    label: {
        color: new DynamicValue('black', 'white'),
        fontFamily: 'Baloo',
        fontSize: width / 25,
        textAlign: 'center',
    },
});

const Picker = ({ heading, list, onValueChange, containerStyle, error }) => {
    const styles = useDynamicStyleSheet(Styles);
    let [selected, setSelected] = React.useState(list[0]);
    let [visible, set_visible] = React.useState(false);
    const Item = ({ element }) => {
        return (
            <Pressable onPress={() => { setSelected(element); set_visible(false); onValueChange(element); }} style={{ height: 60, justifyContent: 'center' }}>
                <Text style={[styles.label, { color: element === selected ? global.accent.color : styles.label.color }]}>{element}</Text>
            </Pressable>
        );
    };
    return (
        <Pressable onPress={() => set_visible(true)} style={[styles.box, containerStyle, { borderColor: error ? 'red' : styles.box.borderColor }]}>
            <Modal
                statusBarTranslucent={true}
                visible={visible}
                transparent={true}
                animationType={'slide'}
                onRequestClose={() => set_visible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <Pressable onPress={() => set_visible(false)} style={{ flex: 1.5 }} />
                    <View style={styles.prompt_box}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View style={{ flex: 1 }} />
                            <View style={{ flex: 6, justifyContent: 'flex-end' }}>
                                <Text style={styles.heading}>{heading}</Text>
                            </View>
                            <View style={{ flex: 1 }} />
                        </View>
                        <View style={{ flex: 0.2 }} />
                        <View style={{ flex: 4 }}>
                            <ScrollView style={{ marginLeft: 10, marginRight: 10 }} >
                                {list.map((element) => {
                                    return <Item element={element} />;
                                })}
                            </ScrollView>
                        </View>
                        <View style={{ flex: 0.5 }} />
                    </View>
                </View>
            </Modal>
            <Text style={[styles.box_label, { color: error ? 'red' : styles.box_label.color }]}>{selected}</Text>
        </Pressable>
    );
};

export default Picker;
