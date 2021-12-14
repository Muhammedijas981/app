import * as React from 'react';
import { View, Text, Dimensions, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDynamicStyleSheet } from 'react-native-dark-mode';
import EncryptedStorage from 'react-native-encrypted-storage';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import dynamicStyles from '../styles/Splash';

// eslint-disable-next-line no-undef
export default Splash = ({ navigation }) => {
    const styles = useDynamicStyleSheet(dynamicStyles);
    let [status, set_status] = React.useState('Tap to unlock');
    const securepass = async () => {
        const creds = await EncryptedStorage.getItem('user_creds');
        navigation.reset({
            index: 0,
            routes: [{ name: creds !== null ? 'Tabs' : 'Login' }],
        });
        navigation.navigate(creds !== null ? 'Tabs' : 'Login');
    };

    async function login() {
        if (await EncryptedStorage.getItem('fingerprint') !== null) {
            FingerprintScanner
                .authenticate({ title: 'Log into Selseus', description: "If fingerprint isn't working, disable it in phone's settings", cancelButton: 'Cancel' })
                .then(() => {
                    securepass();
                }).catch(async (error) => {
                    if (error.name === 'FingerprintScannerNotEnrolled') {
                        await EncryptedStorage.removeItem('fingerprint');
                        set_status('Logged in');
                    } else {
                        FingerprintScanner.release();
                        set_status('Authentication failure');
                        setTimeout(() => set_status('Tap to unlock'), 1000);
                    }
                });
        } else securepass();
    }

    React.useEffect(() => {
        login();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <SafeAreaView style={styles.root}>
            <View style={{ Flex: 1 }} />
            <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../assets/img/logo.png')}
                    style={styles.logo}
                />
            </View>
            <Pressable onPress={() => {
                if (status === 'Tap to unlock') {
                    FingerprintScanner
                        .authenticate({ title: 'Log into Selseus', description: "If fingerprint isn't working, disable it in phone's settings", cancelButton: 'Cancel' })
                        .then(() => {
                            securepass();
                        }).catch(async (error) => {
                            if (error.name === 'FingerprintScannerNotEnrolled') {
                                await EncryptedStorage.removeItem('fingerprint');
                                set_status('Logged in');
                            } else {
                                set_status('Authentication failure');
                                setTimeout(() => set_status('Tap to unlock'), 2000);
                            }
                        });
                }
            }} style={{ flex: 1, alignItems: 'center' }}>
                {status ? <MaterialIcon name={'fingerprint'} size={Dimensions.get('window').height / 15} color={'gray'} /> : null}
                <Text style={styles.status}>{status}</Text>
            </Pressable>
        </SafeAreaView >
    );
};
