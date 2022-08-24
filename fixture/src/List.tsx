/** *
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  StyleSheet,
} from "react-native";
import { FlashList } from "@shopify/flash-list";

const generateArray = (size: number) => {
  const arr = new Array(size);
  for (let i = 0; i < size; i++) {
    arr[i] = i;
  }
  return arr;
};

let counter = 0;

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return () => setValue((value) => value + 1);
  // An function that increment 👆🏻 the previous state like here
  // is better than directly setting `value + 1`
}

const Item = ({ item }: { item: number }) => {
  const backgroundColor = item % 2 === 0 ? "#00a1f1" : "#ffbb00";

  const index = useRef(counter++).current;
  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: "#ffbb00",
        // height: item % 2 === 0 ? 100 : 200,
      }}
    >
      <Text style={{ fontSize: 30 }}>Cell Id: {index}</Text>
    </View>
  );
};

const List = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(generateArray(100));

  const list = useRef<FlashList<number> | null>(null);

  const forceUpdate = useForceUpdate();

  const removeItem = (item: number) => {
    setData(
      data.filter((dataItem) => {
        return dataItem !== item;
      })
    );
    list.current?.prepareForLayoutAnimationRender();
    // after removing the item, we start animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const renderItem = ({ item }: { item: number }) => {
    return <Item item={item} />;
  };

  // const [recyclingPool, setRecyclingPool] = useState<number[]>([]);
  const recyclingPoolRef = useRef<number[]>([]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 20, paddingHorizontal: 10 }}>
          Recyling pool
        </Text>
        <View style={{ paddingVertical: 20, flexDirection: "row" }}>
          {recyclingPoolRef.current.map((item) => (
            <Text key={item} style={{ fontSize: 20, paddingHorizontal: 10 }}>
              {item}
            </Text>
          ))}
          {recyclingPoolRef.current.length === 0 && (
            <Text style={{ fontSize: 20, paddingHorizontal: 10 }}>Empty</Text>
          )}
        </View>
      </View>
      <FlashList
        ref={list}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
          }, 2000);
        }}
        keyExtractor={(item: number) => {
          return item.toString();
        }}
        onViewableItemsChanged={(info) => {
          let newRecyclingPool = [...recyclingPoolRef.current];
          info.changed.forEach((item) => {
            if (item.isViewable) {
              newRecyclingPool = [
                ...newRecyclingPool.filter(
                  (poolItem) => poolItem !== item.item % 12
                ),
              ];
            } else {
              newRecyclingPool = [...newRecyclingPool, item.item % 12];
            }
          });
          recyclingPoolRef.current = [...newRecyclingPool];
          forceUpdate();
        }}
        renderItem={renderItem}
        estimatedItemSize={100}
        data={data}
      />
    </View>
  );
};

export default List;

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-around",
    alignItems: "center",
    height: 120,
    backgroundColor: "#00a1f1",
  },
});
