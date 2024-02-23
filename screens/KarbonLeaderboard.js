import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Modal, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../screens/FirebaseConfig';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; 
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { collection, getDocs, query, orderBy, collectionGroup } from 'firebase/firestore';
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import * as shape from 'd3-shape';


function KarbonLeaderboard() {
  const [rankedUsers, setRankedUsers] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add this line

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true); // Set loading to true when fetching starts
        const usersCollectionRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollectionRef);

        const usersData = [];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        querySnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
        
          let totalEmission = 0; // Default to 100
          let emissionlogs = [{ day: "2024-01-01", value: "100" }]; // Default log
        
          if ('emissionlogs' in userData && Array.isArray(userData.emissionlogs) && userData.emissionlogs.length > 0) {
            const logs = userData.emissionlogs.filter(log => {
              // Check if 'value' is in log and if the log is from the current month
              const logDate = new Date(log.day);
              return 'value' in log && logDate.getFullYear() === currentYear && logDate.getMonth() === currentMonth;
            }).map(log => ({ ...log, name: userData.name }));
        
            if (logs.length > 0) {
              totalEmission = logs.reduce((total, log) => total + Number(log.value), 0);
              emissionlogs = logs;
            }
          }
        
          // Fetch bio, email, and phone
          const bio = userData.bio || '';
          const email = userData.email || '';
          const phone = userData.phone || '';
        
          usersData.push({ name: userData.name, profile: userData.profile, emission: parseFloat(totalEmission.toFixed(2)), emissionlogs: emissionlogs, bio, email, phone });
        });

        // Order users by total emission from lowest to highest
        const rankedUsers = usersData.sort((a, b) => b.emission - a.emission).map((user, index) => ({
          ...user,
          rank: index + 1,
        }));

        // Set state with ranked users
        setRankedUsers(rankedUsers);

        // Create topUsers array
        const topUsers = rankedUsers.length >= 3 ? [rankedUsers[1], rankedUsers[0], rankedUsers[2]] : rankedUsers.slice(0, 3);
        setTopUsers(topUsers);

        // Print ranked users to the console
        // console.log(rankedUsers);
      } catch (error) {
        console.error('Error fetching user documents:', error);
      } finally {
        setIsLoading(false); // Set loading to false when fetching ends
      }
    };

    fetchData();
  }, []);


  const navigation = useNavigation();

  function getOrdinalSuffix(rank) {
    let j = rank % 10,
        k = rank % 100;
    if (j === 1 && k !== 11) {
      return rank + "st";
    }
    if (j === 2 && k !== 12) {
      return rank + "nd";
    }
    if (j === 3 && k !== 13) {
      return rank + "rd";
    }
    return rank + "th";
  }

  const CustomModal = ({ isVisible, closeModal, selectedUser }) => {
    // Check if selectedUser is not null and if user.profile is available, otherwise use a default profile icon
    const hasProfileIcon = selectedUser && selectedUser.profile && selectedUser.profile !== '';
    const profileIconName = hasProfileIcon ? 'user' : selectedUser?.profile;
    const profileIconType = hasProfileIcon ? 'font-awesome' : 'custom'; // Replace with the actual icon type if using a different library
    
    // Decide whether to render an Icon or an Image based on the type of profile
    const profileComponent = hasProfileIcon ? (
      <Image source={{ uri: selectedUser?.profile }} style={styles.profileImage1} />
    ) : (
      <Icon name={'user'} type={'font-awesome'} size={80} color="black" style={styles.profileIcon} />
    );
  
    // console.log(selectedUser);
    
    const EmissionChart = ({ emissionLogs }) => {
      if (!emissionLogs || !Array.isArray(emissionLogs)) {
        return <Text>No emission data available</Text>;
      }

      const data = [].concat(...emissionLogs.map(log => Number(log.value)));
      // console.log(data);
    
      const dataMin = Math.min(...data);
      const dataMax = Math.max(...data);

      return (
        <View style={{ marginTop: -10, left: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

          <YAxis
            data={data}
            contentInset={{ top: 20, bottom: 20 }}
            svg={{ fill: 'grey', fontSize: 10 }}
            min={dataMin}
            max={dataMax}
            numberOfTicks={5}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <LineChart
              style={{ height: 200, width: 200 }}
              data={data}
              svg={{ stroke: 'rgb(134, 65, 244)' }}
              contentInset={{ top: 20, bottom: 20 }}
              curve={shape.curveNatural}
            >
              <Grid />
            </LineChart>
            <XAxis
              style={{ marginHorizontal: -10 }}
              data={data}
              formatLabel={(value, index) => index % 7 === 0 ? index : ''} // Change this line
              contentInset={{ left: 10, right: 100 }}
              svg={{ fontSize: 10, fill: 'grey' }}
            />
          </View>
        </View>
      );
    };
    

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {profileComponent}
    
            <Text style={styles.userName}>{selectedUser?.name}</Text>
    
            <View style={styles.infoContainer}>
              <Text style={styles.infoContent}>{selectedUser?.emission} kgCO2</Text>
            </View>
    
            {/* Add the line chart if emissionlogs is defined */}
            {selectedUser?.emissionlogs ? (
              <EmissionChart emissionLogs={selectedUser?.emissionlogs} />
            ) : (
              <Text>No emission data available</Text>
            )}
    
            {/* Close button */}
            <Text style={styles.closeButton} onPress={closeModal}>Close</Text>
          </View>
        </View>
      </Modal>
    );
  };



  return (
    isLoading ?       
    <ImageBackground source={require('../assets/homebg.jpg')} style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold', color: 'white' }}>Loading..</Text>
      </View>
    </ImageBackground> : (
    <ImageBackground source={require('../assets/homebg.jpg')} style={{flex: 1}}>
    <View>
        <View style={{ flexDirection: 'row', left: windowWidth * 0.05  }}>
            <View style={{ flexDirection: 'row', left: windowWidth * 0.0005, top: windowHeight * .051  }}>
                <Icon
                    name='arrow-left'
                    type='font-awesome'
                    size={30}
                    color='white'
                    onPress={() => navigation.navigate('KarbonStatistics')}
                />
            </View>
        <View style={styles.headerContainer}>
            <Text style={styles.header}>DAILY RANKINGS</Text>
        </View>
        </View>
      <View style={styles.headerBottomContainer}>
        <Text style={styles.headerBottom1}>Compete with your friends and get the highest</Text>
        <Text style={styles.headerBottom2}>carbon footprint reduced in your circle!</Text>
      </View>

      
      <View style={styles.rankContainer}>
      {topUsers.map((user, i) => (
        <ImageBackground source={require('../assets/nav7.png')} style={[styles.rankCard, i === 1 && styles.middleCard]} key={i}>
      {user.profile && user.profile !== '' ? (
        <Image source={{ uri: user.profile }} style={{ width: 40, height: 40, borderRadius: 10, marginTop: windowHeight * 0.02, }} />
      ) : (
        <Icon
          name='user'
          type='font-awesome'
          size={40}
          color='white'
        />
      )}
      <TouchableOpacity onPress={() => {
        setSelectedUser({
          ...user,
          type: 'topUser',
          profile: user.profile,
          name: user.name,
          emission: user.emission,
          emissionlogs: user.emissionlogs,
        });
        setModalVisible(true);
      }}>
        <Text style={styles.rankText}>{getOrdinalSuffix(user.rank)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.name}>{user.name}</Text>
            {user.email ? <Icon name='star' type='font-awesome' color='green' size={10} style={{ margin: 2, top: -2 }} /> : null}
          </View>
        <Text style={styles.emission}>{user.emission} kgCO2</Text>
      </TouchableOpacity>
    </ImageBackground>
  ))}
</View>

      

      <View tyle={styles.TableBox}>
      <FlatList
        data={rankedUsers.slice(3, 8)}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index, separators }) => (
          <View>


            <TouchableOpacity onPress={() => {
              setSelectedUser(item);
              setModalVisible(true);
            }}>

            <View style={styles.tableRow}>
              <View style={styles.iconContainer}>
                <View style={styles.iconStyle1}>
                  {item.email ? <Icon name='star' type='font-awesome' color='green'  size={20}  /> : null}
                </View>
                <View style={styles.iconStyle2}>
                  {item.profile && item.profile !== '' ? (
                    // If a profile exists and is not an empty string, display the profile image
                    <Image source={{ uri: item.profile }} style={styles.profileImage} />
                  ) : (
                    // If no profile or an empty string, display the user icon
                    <Icon name='user' type='font-awesome' color='#517fa4' size={40} />
                  )}
                </View>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableBoxText1}>{item.name}</Text>
                <Text style={styles.tableBoxText2}>{item.emission} kgCO2</Text>
              </View>
              </View>
            </TouchableOpacity>




            {index !== rankedUsers.slice(3, 8).length - 1 && <View style={styles.bottomBorder} />}
          </View>
        )}
      />
      </View>
      <CustomModal isVisible={isModalVisible} closeModal={() => setModalVisible(false)} selectedUser={selectedUser} />
    </View>
    </ImageBackground>
    )
  );
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({



  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  infoContent: {
    flex: 1,
    textAlign: 'center',
  },



  userEmail:{
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Montserrat-Light',
  },
  userBio: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Montserrat-Light',
  },
  userPhone: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Montserrat-Light',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background
  },
  modalContent: {
    width: '80%',
    height: '70%', 
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileImage1: {
    width: 120,
    height: 120,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Codec',
    marginBottom: 5,
  },
  emissionInfo: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Montserrat-Light',
  },
  closeButton: {
    fontSize: 16,
    color: 'blue',
    marginTop: 10,
    textAlign: 'center',
  },





  headerContainer: {
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    width: windowWidth * 0.8,
    padding: 10,
    marginTop: windowHeight * 0.04,
    alignSelf: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40, // Set your desired width
    height: 40, // Set your desired height
    borderRadius: 10,
  },
  iconStyle1: {
    marginLeft: 20,
    padding: 0,
    margin: 0, 
  },
  iconStyle2: {
    marginLeft: 30,
  },
  headerBottomContainer: {
    alignSelf: 'center',
  },
  headerBottom1: {
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Montserrat-Light',
    paddingTop: 10,
    fontSize: 12,
    color: 'white',
  },
  headerBottom2: {
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Montserrat-Light',
    fontSize: 12,
    paddingBottom: 10,
    color: 'white',
  },
  header: {
    fontSize: 22,
    color: 'black',
    fontFamily: 'Codec',
    textAlign: 'center',
    fontFamily: 'Montserrat-Light',
  },
  rankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: windowWidth * 0.02,
    marginBottom: windowHeight * 0.02,
  },
  rankCard: {
    borderRadius: 20, 
    overflow: 'hidden',
    alignItems: 'center',
    height: windowHeight * 0.21,
    marginHorizontal: windowWidth * 0.01, // 1% of window width
    width: windowWidth * 0.29, // 26% of window width
    top: windowHeight * 0.05,
  },
  middleCard: {
    height: windowHeight * 0.25, // 25% of window height
    top: windowHeight * 0.009,
  },
  rankText: {
    fontSize: 15,
    marginTop: windowHeight * 0.02,
    fontFamily: 'Codec',
    textAlign: 'center',
  },
  name: {
    fontSize: 11,
    marginTop: windowHeight * 0.01,
    textAlign: 'center',
    fontFamily: 'Codec',
  },
  emission: {
    fontSize: 13,
    fontFamily: 'Montserrat-Light',
  },
  TableBox: {
    alignSelf: 'center',
    height: windowHeight * 0.3, // Adjust this value as needed
    width: windowWidth * 0.9,
    borderRadius: 20,
    overflow: 'hidden'
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: windowHeight * 0.005, 
    width: windowWidth * 1, // Adjust this value as needed
  },
  bottomBorder: {
    height: 3,
    padding: 2,
    width: 300,
    alignSelf: 'center', // Add this line
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  tableCell: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  tableBoxText1: {
    marginRight: 65,
    paddingTop: 5,
    fontFamily: 'Codec',
    fontSize: 15,
    color: 'white',
  },

  tableBoxText2: {
    fontSize: 15,
    marginRight: 60,
    fontFamily: 'Montserrat-Light',
    color: 'white',
  },
});

export default KarbonLeaderboard;