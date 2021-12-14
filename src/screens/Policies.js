import * as React from 'react';
import { View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDynamicStyleSheet } from 'react-native-dark-mode';
import dynamicStyles from '../styles/Policies';

const Policies = () => {
    const styles = useDynamicStyleSheet(dynamicStyles);
    return (
        <View style={styles.root} >
            <View style={{ flex: 0.1, flexDirection: 'row' }}>
                <View style={{ flex: 0.5 }} />
                <View style={{ flex: 6, justifyContent: 'flex-end' }}>
                    <Text style={styles.screen_name}>Privacy Policy</Text>
                </View>
                <View style={{ flex: 2 }} />
            </View>
            <ScrollView style={{ flex: 8, marginLeft: 20, marginRight: 20, marginTop: 10 }}>
                <Text style={styles.content}>Selseus built the Selseus app as a free app. This SERVICE is provided by Selseus at no cost and is intended for use as is.</Text>
                <Text style={styles.content}>This page is used to inform visitors regarding our policies with the collection, use, and disclosure of Personal Information if anyone decided to use our Service.</Text>
                <Text style={styles.content}>If you choose to use our Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that we collect is used for providing and improving the service. We will not use or share your information with anyone except as described in this Privacy Policy.</Text>
                <Text style={styles.heading}>Information Collection and Use</Text>
                <Text style={styles.content}>For a better experience, while using our Service, we may require you to provide us with certain personally identifiable information. The information that we request will be retained by us and used as described in this privacy policy.</Text>
                <Text style={styles.content}>The app does use third party services that may collect information used to identify you.</Text>
                <Text style={styles.content}>We want to inform you that whenever you use our Service, in a case of an error in the app we collect data and information (through third party products) on your phone called Log Data. This Log Data may include information such as your device Internet Protocol (IP) address, device name, operating system version, the configuration of the app when utilizing our Service, the time and date of your use of the Service, and other statistics.</Text>
                <Text style={styles.heading}>Cookies</Text>
                <Text style={styles.content}>Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your device's internal memory.</Text>
                <Text style={styles.content}>This service does not use these "cookies" explicitly. However, the app may use third party code and libraries that use "cookies" to collect information and improve their services. You have the option to either accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to refuse our cookies, you may not be able to use some portions of this service.</Text>
                <Text style={styles.heading}>Service Providers</Text>
                <Text style={styles.content}>We may employ third-party companies and individuals due to the following reasons:</Text>
                <Text style={styles.content}>To facilitate our service</Text>
                <Text style={styles.content}>To provide the service on our behalf</Text>
                <Text style={styles.content}>To perform service-related services; or</Text>
                <Text style={styles.content}>To assist us in analysing how our service is used</Text>
                <Text style={styles.content}>We want to inform users of this service that these third parties have access to your personal information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.</Text>
                <Text style={styles.heading}>Security</Text>
                <Text style={styles.content}>We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.</Text>
                <Text style={styles.heading}>Links to other sites</Text>
                <Text style={styles.content}>This service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</Text>
                <Text style={styles.heading}>Children's Privacy</Text>
                <Text style={styles.content}>These services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13 years of age. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.</Text>
                <Text style={styles.heading}>Changes to this Privacy Policy</Text>
                <Text style={styles.content}>We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page.</Text>
                <Text style={styles.content}>This policy is effective as of 2021-11-16</Text>
                <Text style={styles.heading}>Contact Us</Text>
                <Text style={styles.content}>If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at selseus@yahoo.com.</Text>
            </ScrollView>
        </View>
    );
};

export default Policies;