import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';

function RealTimeScreen() {
  const [carbonIntensityData, setCarbonIntensityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCarbonIntensity = async () => {
      try {
        const response = await axios.get('https://api.electricitymap.org/v3/carbon-intensity/latest?zone=PH', {
          headers: {
            'auth-token': 'fB344mGyqF3Zb',
          },
        });
        setCarbonIntensityData(response.data);
      } catch (error) {
        console.error('Error fetching carbon intensity:', error.message);
      } finally {
        setLoading(false);
      }
    };

    // Call the function on mount
    getCarbonIntensity();

    // Optional: You can set up a timer to refresh the data at a specific interval
    // const intervalId = setInterval(() => {
    //   getCarbonIntensity();
    // }, 60000); // Refresh every minute

    // return () => clearInterval(intervalId); // Clear the interval on component unmount
  }, []); // Empty dependency array ensures the effect runs only on mount and unmount

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View>
          <Text>Carbon Intensity for Philippines:</Text>
          <Text>Intensity: {carbonIntensityData ? carbonIntensityData.carbonIntensity : 'N/A'}</Text>
          <Text>Estimation: {carbonIntensityData ? (carbonIntensityData.isEstimated ? 'Yes' : 'No') : 'N/A'}</Text>
          <Text>Update Time: {carbonIntensityData ? carbonIntensityData.updatedAt : 'N/A'}</Text>

          {/* Additional details based on the data structure */}
          {/* Case 1 */}
          {carbonIntensityData && carbonIntensityData.zone && carbonIntensityData.carbonIntensity && (
            <View>
              <Text>Zone: {carbonIntensityData.zone}</Text>
              <Text>Carbon Intensity: {carbonIntensityData.carbonIntensity}</Text>
              <Text>DateTime: {carbonIntensityData.datetime}</Text>
              <Text>UpdatedAt: {carbonIntensityData.updatedAt}</Text>
              <Text>Emission Factor Type: {carbonIntensityData.emissionFactorType}</Text>
              <Text>Is Estimated: {carbonIntensityData.isEstimated.toString()}</Text>
              <Text>Estimation Method: {carbonIntensityData.estimationMethod}</Text>
            </View>
          )}

          {/* Case 2 */}
          {carbonIntensityData && carbonIntensityData.zone && carbonIntensityData.powerConsumptionBreakdown && (
                <View>
                <Text>Zone: {carbonIntensityData.zone}</Text>
                <Text>DateTime: {carbonIntensityData.datetime}</Text>
                <Text>UpdatedAt: {carbonIntensityData.updatedAt}</Text>
                <Text>Nuclear Power Consumption: {carbonIntensityData.powerConsumptionBreakdown.nuclear}</Text>
                <Text>Hydro Power Consumption: {carbonIntensityData.powerConsumptionBreakdown.hydro}</Text>
                <Text>Wind Power Consumption: {carbonIntensityData.powerConsumptionBreakdown.wind}</Text>
                <Text>Solar Power Consumption: {carbonIntensityData.powerConsumptionBreakdown.solar}</Text>
                <Text>Gas Power Consumption: {carbonIntensityData.powerConsumptionBreakdown.gas}</Text>
                <Text>Coal Power Consumption: {carbonIntensityData.powerConsumptionBreakdown.coal}</Text>
                <Text>Oil Power Consumption: {carbonIntensityData.powerConsumptionBreakdown.oil}</Text>
                <Text>Biofuel Power Consumption: {carbonIntensityData.powerConsumptionBreakdown.biofuel}</Text>
                <Text>Unknown Power Consumption: {carbonIntensityData.powerConsumptionBreakdown.unknown}</Text>
            
              {/* Add more breakdown details as needed */}
            </View>
          )}

          {/* Case 3 */}
          {carbonIntensityData && carbonIntensityData.zone && carbonIntensityData.history && (
            <View>
              <Text>Zone: {carbonIntensityData.zone}</Text>
              {carbonIntensityData.history.map((entry) => (
                <Text key={entry.datetime}>{`DateTime: ${entry.datetime}, Carbon Intensity: ${entry.carbonIntensity}`}</Text>
              ))}
            </View>
          )}

          {/* Case 4 */}
          {carbonIntensityData && carbonIntensityData.zone && carbonIntensityData.history && (
            <View>
              <Text>Zone: {carbonIntensityData.zone}</Text>
              {carbonIntensityData.history.map((entry) => (
                <View key={entry.datetime}>
                  <Text>DateTime: {entry.datetime}</Text>
                  <Text>Fossil-Free Percentage: {entry.fossilFreePercentage}%</Text>
                  {/* Add more breakdown details as needed */}
                </View>
              ))}
            </View>
          )}

          {/* Case 5 */}
          {carbonIntensityData && carbonIntensityData.zone && carbonIntensityData.data && (
            <View>
              <Text>Zone: {carbonIntensityData.zone}</Text>
              {carbonIntensityData.data.map((entry) => (
                <View key={entry.datetime}>
                  <Text>DateTime: {entry.datetime}</Text>
                  <Text>Renewable Percentage: {entry.renewablePercentage}%</Text>
                  {/* Add more breakdown details as needed */}
                </View>
              ))}
            </View>
          )}

          {/* Case 6 */}
          {carbonIntensityData && carbonIntensityData.zone && carbonIntensityData.forecast && (
            <View>
              <Text>Zone: {carbonIntensityData.zone}</Text>
              {carbonIntensityData.forecast.map((entry) => (
                <View key={entry.datetime}>
                  <Text>DateTime: {entry.datetime}</Text>
                  <Text>Power Production Total: {entry.powerProductionTotal}</Text>
                  {/* Add more breakdown details as needed */}
                </View>
              ))}
            </View>
          )}

          {/* Example Line Chart */}
          {carbonIntensityData && carbonIntensityData.history && (
            <LineChart
              data={{
                labels: carbonIntensityData.history.map((entry) => entry.datetime),
                datasets: [
                  {
                    data: carbonIntensityData.history.map((entry) => entry.carbonIntensity),
                  },
                ],
              }}
              width={300}
              height={200}
              yAxisLabel="CO2 (gCO2eq/kWh)"
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: '#fb8c00',
                backgroundGradientTo: '#ffa726',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffa726',
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RealTimeScreen;
