import { Dimensions } from 'react-native';
import { DynamicStyleSheet, DynamicValue } from 'react-native-dark-mode';
import global from './global';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default new DynamicStyleSheet({
    ...global,
    heading_image: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
    },
    beta_text: {
        color: 'gray',
        fontSize: 10,
        fontFamily: 'Baloo-Bold',
        marginTop: 20,
    },
    status_icon: {
        color: new DynamicValue('gray', 'white'),
        fontSize: height / 35,
    },
    item_root: {
        height: 80,
    },
    item_container: {
        height: 80,
        flex: 2,
        width: width - 20,
        marginLeft: 10,
        marginRight: 10,
        justifyContent: 'center',
        borderRadius: 20,
    },
    wrapper: {
        flex: 2,
    },
    item_temperature: {
        fontSize: 25,
        fontFamily: 'Baloo',
        color: new DynamicValue('black', 'white'),
    },
    item_date: {
        color: 'gray',
        fontFamily: 'Baloo-Bold',
    },
    prompt_gif: {
        height: width / 3,
        width: width / 3,
        resizeMode: 'contain',
    },
    prompt_temperature: {
        fontSize: height / 25,
        fontFamily: 'Baloo-Bold',
    },
    prompt_date: {
        color: 'gray',
        fontSize: height / 40,
        fontFamily: 'Baloo',
    },
    prompt_status: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: width / 25,
        fontFamily: 'Baloo-Bold',
    },
    float_button_heights: {
        height: height / 1.2,
        // justifyContent: 'center',
    },
    placeholder: {
        color: 'gray',
        fontFamily: 'Baloo',
        textAlign: 'center',
        fontSize: width / 25,
    },
    scan_button: {
        height: height / 12,
        width: height / 12,
        marginBottom: height < 740 ? height / 5 : height / 6,
        marginRight: width / 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: global.accent.color,
    },
    scan_button_icon: {
        color: 'white',
        fontSize: height / 20,
        fontFamily: 'Baloo',
    },
    scanner_bg: {
        flex: 1,
        backgroundColor: new DynamicValue('white', 'black'),
    },

    camera: {
        width: width / 1.1,
        height: width / 1.1,
        alignSelf: 'center',
    },

    //custom marker
    marker_outline: {
        height: width / 1.8,
        width: width / 1.8,
    },
    marker_squares: {
        flex: 1,
        borderColor: global.accent.color,
    },

    torch_button: {
        height: 50,
        width: 50,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },

    info: {
        color: new DynamicValue('black', 'white'),
        fontFamily: 'Baloo',
    },
    heading: {
        color: new DynamicValue('black', 'white'),
        fontSize: 20,
        fontFamily: 'Baloo',
        marginTop: 30,
    },
    sub_heading: {
        color: 'gray',
        fontSize: 15,
        fontFamily: 'Baloo',
        textAlign: 'center',
    },
});
