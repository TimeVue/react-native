import React, {useState} from 'react';
import {Avatar, Box, FlatList, Heading, HStack, Text, View, VStack, Spacer} from "native-base";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function (){
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    React.useEffect(() => {
        AsyncStorage.getItem('timeVue_url')
            .then(url => {
                if(url !== null){
                    axios.get<Employee>(url)
                        .then(r => setShifts(r.data.shifts.reverse()))
                }
            })
    })

    const reload = () => {
        setRefreshing(true)
        AsyncStorage.getItem('timeVue_url')
            .then(url => {
                if(url !== null){
                    axios.get<Employee>(url)
                        .then(r => {
                            setShifts(r.data.shifts.reverse())
                            setRefreshing(false)
                        })
                }
            })
    }

    const toSecondsString = (milliseconds: number) => {
        const dateDifference = new Date(milliseconds)
        if(dateDifference.getSeconds() > 0){
            dateDifference.setMinutes(dateDifference.getMinutes()+1)
        }
        return `${dateDifference.getHours()-1}h ${dateDifference.getSeconds() > 0 ? dateDifference.getMinutes() : dateDifference.getMinutes()-1}m`
    }

    return (
        <Box>
            <FlatList data={shifts} h="100%"
                      onRefresh={reload}
                      refreshing={refreshing}
                      renderItem={({
                                                   item
                                               }) => <Box borderBottomWidth="1" _dark={{
                borderColor: "gray.600"
            }}borderColor="coolGray.200" pl="4" pr="5" py="2">
                <HStack space={3} justifyContent="space-between" align-items="center">
                    <VStack>
                        <Text _dark={{
                            color: "warmGray.50"
                        }} color="coolGray.800" bold>
                            {new Date(item.startTime).toLocaleString()}
                        </Text>
                        <Text color="coolGray.600" _dark={{
                            color: "warmGray.200"
                        }}>
                            Ende: {new Date(item.endTime).toLocaleString()}
                        </Text>
                    </VStack>
                    <Spacer />
                    <Text _dark={{
                        color: "warmGray.50"
                    }} color="coolGray.800" alignSelf="flex-start">
                        {toSecondsString(item.totalSeconds*1000)}
                    </Text>
                </HStack>
            </Box>} keyExtractor={item => item.id} />
        </Box>
    );
}