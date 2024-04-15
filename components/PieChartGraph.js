import {React, useEffect, useState} from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useSQLiteContext } from "expo-sqlite/next";

const PieChartGraph = () => {
    const [chartData, setChartData] = useState([]);
    const colors = ["#228cdb", "#4cb1ff", "#aedcff"]

    const db = useSQLiteContext();

    useEffect(() => {
        const getTopExercises = async () => {
            try{
                const response = await db.getAllAsync(`
                    SELECT e.exercise_name, AVG(l.weights / (1.0278 - 0.0278 * CAST(l.reps AS INTEGER))) AS avg_1rm
                    FROM Logs l
                    INNER JOIN Exercises e ON l.exercise_id = e.id
                    GROUP BY e.exercise_name
                    ORDER BY avg_1rm DESC
                    LIMIT 3;
                `)

                const exercises = response.map((item, index) => ({
                    name: item.exercise_name,
                    population: parseFloat(item.avg_1rm.toFixed(2)),
                    color: colors[index],
                    legendFontSize: 14
                }))
                setChartData(exercises);
            }catch(e){
                console.log("Error fetching exercises info: ", e);
            }
        }
        getTopExercises();
        console.log(chartData)
    }, [])

    return(
        <View>
            <View>
                <Text style={{fontSize: 20, fontWeight: '600'}}>
                    Strongest lifts
                </Text>
            </View>
            <View>
                {
                    chartData == [] ? 
                        <Text>
                            No data available
                        </Text>
                    :
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <PieChart
                                data={chartData}
                                width={Dimensions.get("window").width - 40} // from react-native
                                height={220}
                                backgroundColor='#d9d9d980'
                                hasLegend={false}
                                chartConfig={{
                                    decimalPlaces: 2,
                                    color: (opacity = 1) => `rgba(33, 126, 194, ${opacity})`,
                                    style: {
                                        borderRadius: 16
                                    },
                                    propsForDots: {
                                        r: "6",
                                        strokeWidth: "2",
                                        stroke: "#FFFFFF"
                                    }
                                }}       
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,
                                }}                 
                                accessor={"population"}
                                paddingLeft="15"
                                absolute
                            /> 
                            <View style={{right: '60%', gap: 20}}>
                            {
                                chartData.map((item, index) => (
                                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}} key={index}>
                                        <View
                                            style={[{width: 20, height: 20, borderRadius: "50%"}, {backgroundColor: item.color}]}
                                        ></View>
                                        <View style={{alignItems: 'center'}}>
                                            <Text style={{fontSize: 14}}>{item.name}</Text>
                                            <Text>{item.population}Kg</Text>
                                        </View>
                                    </View>

                                ))
                            }
                            </View>
                        </View>
                }
            </View>
        </View>
    )
}

export default PieChartGraph;