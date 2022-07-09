import React, {useContext, useState, useMemo} from 'react';
import {
    Box,
    Button,
    Heading,
    NativeBaseProvider,
    Text,
    useToast,
    Spacer,
    FormControl,
    Stack,
    WarningOutlineIcon,
    Input,
    KeyboardAvoidingView,
    Image, VStack, View
} from 'native-base';
import {NavigationContainer} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Ionicons from '@expo/vector-icons/Ionicons';
import ShiftHistory from "./tabs/ShiftHistory";
import Dashboard from "./tabs/Dashboard";
import {Linking, Platform, SafeAreaView} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as url from "url";
import 'react-native-url-polyfill/auto';
import {ShowAppContext} from "./context/ShowAppContext";
import Toast from 'react-native-toast-message';


const Tab = createBottomTabNavigator();

export default function App() {
    const [showApp, setShowApp] = useState(false);
    const [loginInput, setLoginInput] = useState("");

    const toast = useToast()

    const showAppContext = useMemo(() => ({
        logout(){
            setShowApp(false)
            AsyncStorage.removeItem('timeVue_url')
                .then(() => {

                    Toast.show({
                        type: 'info',
                        text1: 'Abgemeldet!',
                        text2: 'Sie wurden erfolgreich abgemeldet!'
                    })
                })
                .catch(() => {
                    console.log("error!")
                })
        }

    }), undefined);



    AsyncStorage.getItem("timeVue_url")
        .then(url => {
            if(url !== null){
                setShowApp(true)
            }
        })

    Linking.addEventListener('url', (event) => {
        console.log("Hi")
        const url = new URL(event.url);
        if(url.searchParams.get('url') !== null){
            if(url.searchParams.get('url')!.includes('/api/v1/employee/')){
                try{
                    AsyncStorage.setItem('timeVue_url', url.searchParams.get('url') as string)
                        .then(r => {
                            setShowApp(true)
                            Toast.show({
                                type: 'success',
                                text1: 'Login erfolgreich!',
                                text2: 'Sie wurden erfolgreich authentifiziert!'
                            })
                        })
                }catch (e) {
                    Toast.show({
                        type: 'error',
                        text1: 'URL fehlerhaft!',
                        text2: 'Diese URL ist keine TimeVue App-URL!'
                    })
                }
            }else{
                Toast.show({
                    type: 'error',
                    text1: 'URL fehlerhaft!',
                    text2: 'Diese URL konnte nicht verarbeitet werden!'
                })
            }
        }
    })

    Linking.getInitialURL()
        .then(url => {
            if(url !== null){
                // Store User API Endpoint
            }
        })

    function login(url: string){
        console.log(url)
        if(url.includes('/employee/')){
            // format URL
            const urlModel = new URL(url);
            url = urlModel.protocol + "//" + urlModel.hostname + "/api/v1/employee/" + url.split("/")[url.split("/").length-1]
            try{
                AsyncStorage.setItem('timeVue_url', url)
                    .then(r => {
                        setShowApp(true)
                        Toast.show({
                            type: 'success',
                            text1: 'Login erfolgreich!',
                            text2: 'Sie wurden erfolgreich authentifiziert!'
                        })
                    })
            }catch (e) {
                Toast.show({
                    type: 'error',
                    text1: 'URL fehlerhaft!',
                    text2: 'Diese URL ist keine TimeVue App-URL!'
                })
            }
        }else{
            Toast.show({
                type: 'error',
                text1: 'URL fehlerhaft!',
                text2: 'Diese URL konnte nicht verarbeitet werden!'
            })
        }
    }

    // @ts-ignore
    return (
        <NativeBaseProvider>
            <ShowAppContext.Provider value={showAppContext}>
            {showApp &&
                <NavigationContainer>
                    <Tab.Navigator>
                        <Tab.Screen name={"Dashboard"} options={{tabBarIcon: ({color}) => <Ionicons name="timer-outline" size={24} color={color} />}} component={Dashboard}></Tab.Screen>
                        <Tab.Screen name={"Schichthistorie"} options={{tabBarIcon: ({color}) => <Ionicons name="calendar-outline" size={24} color={color} />}} component={ShiftHistory}></Tab.Screen>
                    </Tab.Navigator>
                </NavigationContainer>
            }
            {!showApp &&
                <>
                    <View m={"auto"}>
                        <Box maxW={80}>
                            <Image mb={5} source={require('./assets/logo_text_m0.png')} alt={"TimeVue Logo"} resizeMode={"contain"} h={70}/>
                            <Text color="muted.500">Um die App zu aktivieren, fügen Sie bitte unten in das Feld die Ihnen von Ihrem Arbeitgeber mitgeteilte Adresse ein!</Text>
                            <FormControl isRequired>
                                <Stack w="100%">
                                    <FormControl.Label>TimeVue Adresse</FormControl.Label>
                                    <Input keyboardType="url" autoCapitalize={"none"} autoCorrect={false} onChangeText={setLoginInput} type="text" w="100%" placeholder="https://time.example.com/employee/123" />
                                </Stack>
                            </FormControl>
                            <Button w={"100%"} mt="5" onPress={() => login(loginInput)}>App verbinden</Button>
                        </Box>
                    </View>

                </>
            }
            <Toast/>
            </ShowAppContext.Provider>
        </NativeBaseProvider>
    );
}
