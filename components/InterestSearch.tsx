import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";

const API_URL = "https://be-v2.convose.com/autocomplete/interests";
const AUTH_TOKEN = "";

interface InterestsSearchType {
  id: number;
  name: string;
  type: string;
  match: number;
  color: string;
  avatar: string | null;
  existing: boolean;
}

const InterestsSearch = () => {
  const [interests, setInterests] = useState<InterestsSearchType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [page, setPage] = useState(0);
  const [pagesLeft, setPagesLeft] = useState(1);

  const fetchInterests = async (query: string, pageNo: number) => {
    if (pagesLeft === 0) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}?q=${query}&limit=12&from=${pageNo * 12}`,
        {
          headers: {
            Authorization: AUTH_TOKEN,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();
      if (pageNo === 0) {
        setInterests(data.autocomplete);
      } else {
        setInterests((prev) => [...prev, ...data.autocomplete]);
      }
      setPagesLeft(data.pages_left);
    } catch (error) {
      console.error("Error fetching interests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setPage(0);
    if (!isLoadMore) fetchInterests(q, 0);
  }, []);

  useEffect(() => {
    fetchInterests("", 0);
  }, []);

  const loadMore = async () => {
    if (!loading && pagesLeft > 0) {
      setIsLoadMore(true);
      setPage((prevPage) => {
        const newPage = prevPage + 1;
        fetchInterests(searchQuery, newPage);
        setIsLoadMore(true);
        return newPage;
      });
    }
  };

  const renderItem = ({ item }: { item: InterestsSearchType }) => (
    <View style={styles.itemContainer}>
      {item.avatar && (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      )}
      <Text style={[styles.item, { color: item.color }]}>{item.name}</Text>
    </View>
  );

  const getSortedInterests = () => {
    if (!searchQuery) return interests;
    console.log("search query .......", searchQuery);
    const availableFirst = interests.filter((item) =>
      item.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    );

    return [...availableFirst];
  };

  return (
    <View style={styles.container}>
      <FlatList
        inverted={true}
        data={getSortedInterests()}
        keyExtractor={(item) => item.id.toString() + item.name}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#007AFF" /> : null
        }
        style={styles.list}
      />

      <TextInput
        style={styles.input}
        placeholder="Search Interests..."
        onChangeText={(text) => {
          setSearchQuery(text);
          handleSearch(text);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 10,
    paddingTop: 50,
  },
  list: {
    flex: 1,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  item: {
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default InterestsSearch;
