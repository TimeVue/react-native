import {Alert, Box, Button, Divider, Heading, HStack, Spinner, Stack, Text, useToast, View, VStack} from "native-base";
import React, {useContext, useState} from "react";
import {ShowAppContext} from "../context/ShowAppContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from 'expo-location';
import Toast from "react-native-toast-message";
import checkPoint from "point-in-cirlce"

export default function ({navigation}){
    const toast = useToast();

    const [loadingShift, setLoadingShift] = useState(false);
    // @ts-ignore
    const [me, setMe] = useState<Employee>(null);

    // @ts-ignore
    const {logout} = useContext(ShowAppContext);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button onPress={() => logout()} mr={2}><Ionicons name={"exit-outline"} color={'white'}></Ionicons></Button>
            ),
        })
    })

    let fullURL = "";
    let hostURL = "";

    React.useEffect(() => {
        AsyncStorage.getItem('timeVue_url')
            .then(url => {
                if(url !== null){
                    hostURL = new URL(url).hostname
                    fullURL = url;
                    axios.get<Employee>(url)
                        .then(r => setMe(r.data))
                }
            })
    })

    const startShift = () => {
        Location.requestForegroundPermissionsAsync()
            .then(r => {
                if(r.status !== 'granted'){
                    Toast.show({
                        type: 'error',
                        text1: "Schicht kann nicht gestartet werden!",
                        text2: "Ohne Standorterlaubnis kann keine Schicht gestartet werden!"
                    })
                    setLoadingShift(false)
                    return;
                }

                Location.getCurrentPositionAsync({})
                    .then(l => {
                        axios.get("https://" + hostURL + "/var/requiredLocation")
                            .then(reqLoc => {
                                const circle = {
                                    circleLat : parseFloat(reqLoc.data.lat),
                                    circleLng : parseFloat(reqLoc.data.lon),
                                    circleRadius : parseFloat(reqLoc.data.rad)
                                }

                                if(checkPoint(l.coords.latitude, l.coords.longitude, circle).result){
                                    axios.put<Employee>(fullURL + "/shifts")
                                        .then(r => {
                                            Toast.show({
                                                type: 'success',
                                                text1: 'Schicht gestartet!',
                                                text2: 'Die Schicht wurde erfolgreich gestartet!'
                                            })

                                            setMe(r.data)
                                        })
                                }else{
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Schicht konnte nicht gestartet werden!',
                                        text2: 'Sie müssen sich am entsprechenden Standort befinden!'
                                    })
                                }

                                setLoadingShift(false)
                            })

                    })
            })
    }

    const stopShift = () => {
        axios.delete<Employee>(fullURL + "/shifts/" + me.currentShift!.id)
            .then(r => {
                setMe(r.data)

                setLoadingShift(false)
            })
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {me !== null &&
                <Box>
                    <Box maxW="80" w="80" rounded="lg" overflow="hidden" borderColor="coolGray.200" borderWidth="1" _dark={{
                        borderColor: "coolGray.600",
                        backgroundColor: "gray.700"
                    }} _web={{
                        shadow: 2,
                        borderWidth: 0
                    }} _light={{
                        backgroundColor: "gray.50"
                    }}>
                        <Stack p="4" space={3}>
                            <Heading size="md">
                                Hi, {me.name}!
                            </Heading>
                            <Divider mt="0"/>
                            {me.currentShift !== null &&
                                <>
                                    <Alert w="100%" status={"success"}>
                                        <VStack space={2} flexShrink={1} w="100%">
                                            <HStack flexShrink={1} space={2} justifyContent="space-between">
                                                <HStack space={2} flexShrink={1}>
                                                    <Alert.Icon mt="1" />
                                                    <Text fontSize="md" color="coolGray.800">
                                                        Eine Schicht ist seit {new Date(me.currentShift!.startTime).toLocaleTimeString()} aktiv.
                                                    </Text>
                                                </HStack>
                                            </HStack>
                                        </VStack>
                                    </Alert>
                                    <Divider/>
                                </>
                            }

                            <Button disabled={loadingShift} colorScheme={me.currentShift === null ? "success" : "danger"} onPress={() => {
                                setLoadingShift(true)

                                if(me.currentShift === null){
                                    // Start new Shift
                                    startShift()
                                }else{
                                    // Stop shift
                                    stopShift()
                                }
                            }}>
                                {loadingShift
                                    ? <Spinner color="white"/>
                                    : me.currentShift === null
                                    ? "Schicht starten"
                                        : "Schicht stoppen"
                                }
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            }

            {me === null &&
                <Text m="auto">Lädt...</Text>
            }
        </View>
    );
}