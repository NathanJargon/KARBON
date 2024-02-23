import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, RefreshControl, ActivityIndicator, ImageBackground, FlatList, Animated, Image } from 'react-native';
import axios from 'axios';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { Modal, TextInput, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

function News() {
  const [news, setNews] = useState([]);
  const [isRefreshing, setRefreshing] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedFilter, setSelectedFilter] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [maxPages, setMaxPages] = useState(7); 
  const [isAtTop, setIsAtTop] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
  });

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    Animated.timing(
      scrollY,
      {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }
    ).start();
  }, []);

  const opacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const openFilterModal = () => {
    setFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const FilterIcon = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity 
        onPress={openFilterModal}
        style={{ flexDirection: 'row', alignItems: 'center' }} // Add this
      >
        <Icon name="filter" size={24} color="#90ee90" />
        <Text style={styles.filterText}>Filter</Text>
      </TouchableOpacity> 
    </View>
  );

  
  class FilterModal extends React.Component {
    state = {
      startDate: '',
      endDate: '',
      showStartDatePicker: false,
      showEndDatePicker: false,
    };
  
    applyFilters = () => {
      this.props.setFilters({
        startDate: this.state.startDate instanceof Date ? this.state.startDate.toISOString() : '',
        endDate: this.state.endDate instanceof Date ? this.state.endDate.toISOString() : '',
        source: this.state.source,
      });
      this.props.closeModal();
    };
  
    render() {
      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.props.modalVisible}
          onRequestClose={this.props.closeModal}
        >
        <View style={styles.centeredView}>
          <ImageBackground source={require('../assets/newsmodalbg.png')} style={styles.modalView} imageStyle={{ borderRadius: 8 }} >
            <Text style={styles.modalText}>Filter Options</Text>

            <Text style={styles.label}>Start Date:</Text>
            <TouchableOpacity onPress={() => this.setState({ showStartDatePicker: true })}>
              <Text style={styles.input}>
                {this.state.startDate && !isNaN(new Date(this.state.startDate)) 
                  ? new Date(this.state.startDate).toLocaleDateString() 
                  : "Click here to select a start date"}
              </Text>
            </TouchableOpacity>
            {this.state.showStartDatePicker && (
              <DateTimePicker
                value={this.state.startDate ? new Date(this.state.startDate) : new Date()}
                mode={'date'}
                display="default"
                onChange={(event, selectedDate) => {
                  this.setState({ startDate: selectedDate, showStartDatePicker: false });
                }}
              />
            )}
            <Text style={styles.label}>End Date:</Text>
            <TouchableOpacity onPress={() => this.setState({ showEndDatePicker: true })}>
              <Text style={styles.input}>
                {this.state.endDate && !isNaN(new Date(this.state.endDate)) 
                  ? new Date(this.state.endDate).toLocaleDateString() 
                  : "Click here to select an end date"}
              </Text>
            </TouchableOpacity>
            {this.state.showEndDatePicker && (
              <DateTimePicker
                value={this.state.endDate ? new Date(this.state.endDate) : new Date()}
                mode={'date'}
                display="default"
                onChange={(event, selectedDate) => {
                  this.setState({ endDate: selectedDate, showEndDatePicker: false });
                }}
              />
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={this.applyFilters}>
                <Text>Apply Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={this.props.closeModal}>
                <Text>Back</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </Modal>
    );
  }
}

  useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }
    ).start();
  }, []);

  const Article = React.memo(({ item }) => {
    const openArticleUrl = (url) => {
      Linking.openURL(url);
    };
  
    const formatDateString = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  
    return (
      <Animated.View style={{opacity: 1}}>
        <TouchableOpacity
          style={styles.articleContainer}
          onPress={() => openArticleUrl(item.url)}
        >
          <ImageBackground 
            source={require('../assets/articlesbg.png')} 
            style={[ styles.articleImage ]}
            imageStyle={{ borderRadius: 8 }}
          > 
            <View style={styles.textContainer}>
              <Text style={styles.articleTitle}>{String(item.title)}</Text>
              <Text style={styles.articleDescription}>{truncateDescription(String(item.description), 20)}</Text>
              <Text style={styles.articleDate}>{formatDateString(String(item.publishedAt))}</Text>
              <Text style={styles.articleSource}>{String(item.source.name)}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </Animated.View>
    );
  }, (prevProps, nextProps) => {
    return prevProps.item.id === nextProps.item.id;
  });
  

  useEffect(() => {
    fetchNews();
  }, [filters]);

  let cache = {};
  const [errorMessage, setErrorMessage] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  

  const fetchNews = async () => {
    try {
      if (page > maxPages) {
        return;
      }
  
      setLoading(true);
  
      const cacheKey = JSON.stringify({
        q: filters.keyword ? `carbon footprint emissions ${filters.keyword}` : 'carbon footprint emissions',
        apiKey: retryCount < 2 ? '74f5be0407c040c1b49cd69f1e6de50e' : '6d604f0b42614d0fabf0388461d91f6d',
        page: page,
        pageSize: 10,
        from: filters.startDate,
        to: filters.endDate,
      });
  
      const cachedData = cache[cacheKey];
  
      const cacheExpiryDuration =  30 * 24 * 60 * 60 * 1000;
      const isCacheValid = cachedData && Date.now() - cachedData.timestamp < cacheExpiryDuration;
  
      if (isCacheValid) {
        setNews((prevNews) => [...prevNews, ...cachedData.data]);
      } else {
        const response = await axios.get('https://newsapi.org/v2/everything', {
          params: JSON.parse(cacheKey),
        });
  
        cache[cacheKey] = {
          data: response.data.articles,
          timestamp: Date.now(),
        };
  
        setNews((prevNews) => [...prevNews, ...response.data.articles]);
      }
  
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        if (retryCount < 2) {
          setErrorMessage('Too many requests, retrying in 5 seconds...');
          setRetryCount(retryCount + 1);
          setTimeout(fetchNews, 5000);
        } else {
          setErrorMessage('Too many requests, please try again later.');
        }
      } else {
        setErrorMessage(`Error fetching news: ${error.message}`);
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };
  
  const openArticleUrl = (url) => {
    Linking.openURL(url);
  };

  const formatDateString = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setNews([]); 
    setPage(1); 
    fetchNews();
  };

  const renderItem = ({ item }) => <Article item={item} fadeAnim={fadeAnim} />;


  const truncateDescription = (description, wordLimit) => {
    const words = description.split(' ');
    let truncatedDescription;
    if (words.length > wordLimit) {
      truncatedDescription = words.slice(0, wordLimit).join(' ') + '...';
    } else {
      truncatedDescription = description;
    }
    return truncatedDescription + ' (click to read more)';
  };


  const renderFooter = () => {
    if (errorMessage) {
      return <Text style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</Text>;
    } else if (isLoading) {
      return (
        <View style={{alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#4caf50" />
          <Text style={{marginTop: 10, fontWeight: 'bold', color: 'black'}}>Fetching articles from official sources...</Text>
        </View>
      );
    } else if (page > maxPages) {
      return <Text style={styles.refreshInstruction}>Click the arrow and swipe down at the top to get new articles!</Text>;
    } else {
      return null;
    }
  };
  

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
  };
  
  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    setIsAtTop(currentOffset < 12);
  };

  
  return (
    <ImageBackground source={require('../assets/newsbg.png')} style={styles.backgroundImage}>
      <FlatList
        ref={flatListRef}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        indicatorStyle="black"
        ListHeaderComponent={FilterIcon}
        contentContainerStyle={styles.container}
        data={news}
        keyExtractor={(item, index) => index.toString()}
        onEndReached={fetchNews}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        renderItem={renderItem}
        removeClippedSubviews={true}
        ListFooterComponent={renderFooter}
      />
      {isFilterModalVisible && <FilterModal setFilters={setFilters} closeModal={closeFilterModal} modalVisible={isFilterModalVisible} />}
      <Animated.View
        style={[
          styles.scrollToTopButton,
          { opacity },
        ]}
      >
        <TouchableOpacity
          onPress={scrollToTop}
          accessible={true}
          accessibilityLabel="Scroll to Top"
        >
          <Icon name="arrow-up" size={20} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', 
  },
  refreshInstruction: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#cefad0',
    fontSize: 16,
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: 'white',
  },
  articleContainer: {
    marginBottom: 20,
    backgroundColor: '#eafce3', 
    borderRadius: 10,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#008000', 
  },
  articleImage: {
    width: '100%',
    height: 200,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  textContainer: {
    padding: 16,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000', 
  },
  articleDescription: {
    fontSize: 13,
    marginBottom: 8,
    color: '#000', 
  },
  articleDate: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  articleSource: {
    fontSize: 12,
    color: '#FFFFFF', 
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterText: {
    marginLeft: 8,
    fontSize: 18,
    color: '#90ee90',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center"
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    borderWidth: 1,
    borderColor: '#90EE90', 
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  inputLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  input: {
    height: 60,
    width: 150,
    textAlign: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    borderColor: 'white',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    fontWeight: "bold",
    fontSize: 20,
    color: '#32CD32',
  },
  scrollToTopButton: {
    position: 'absolute',
    backgroundColor: '#4caf50',
    margin: 20,
    marginLeft: 300,
    borderRadius: 100,
    padding: 10,
    width: 100,
    height: 40,
  },
  scrollToTopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default News;
