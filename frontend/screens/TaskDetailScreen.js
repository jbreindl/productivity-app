import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Dimensions, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default class CreateTaskScreen extends React.Component{
  constructor(props) {
    super(props)
    // Initialize our login state
    this.state = {
      sessionToken: '',
      title: '',
      description: '',
      due_date: '',
      task: [],
      tags: [],
      taskTag: {},
      countries: ["Egypt", "Canada", "Australia", "Ireland"]
    }
    this.onDateChange = this.onDateChange.bind(this);
  }


  async componentDidMount() {
    let token = await SecureStore.getItemAsync('current task')

    this.setState({task: token})
    
    if (token) {
      console.log('Token ' + token)
      this.setState({sessionToken: token})
      this.getTags();
    }
  }

  getTags() {
    fetch("https://young-chow-productivity-app.herokuapp.com/tags/", {
      method: "GET",
      headers: new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + this.state.sessionToken
        }),
      })
    .then((response => response.json()))
    .then(json => {
      var tagArray = []
      for (var tag in json) {
        tagArray.push(json[tag].title)
      }
      this.setState({tags: json})
      console.log(this.state.tags)
     }
    )
  }


  onDateChange(date) {
    console.log(Dimensions.get('window').width)
    this.setState({
      due_date: date,
    });
  }



  onSubmit = () => {
    const { title, description, due_date, taskTag } = this.state;
    const {navigation} = this.props;
    

    // I don't want to talk about it
    var stringDate = due_date.toString().slice(due_date.toString().indexOf(" ")+1, due_date.toString().indexOf("2021 ")+4)
    const formatted = moment(new Date(stringDate)).format('YYYY-MM-DD')
    console.log(formatted)
    console.log(this.state.taskTag.pk)

    SecureStore.getItemAsync('session').then(sessionToken => {
      fetch("https://young-chow-productivity-app.herokuapp.com/tasks/", {
        method: "POST",
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + sessionToken
        }),
        body: JSON.stringify({
          title: title,
          description: description,
          due_date: formatted,
          tag: parseInt(taskTag.pk)

        })
      })
      .then(response => response.json())
      .then(json => {
        // enter login logic here
        console.log(json)
        if(!json.id) {
          if (json.title) Alert.alert("Error: ", json.title.toString())
          else if (json.description) Alert.alert("Error: ", json.description.toString())
          else if (json.due_date) Alert.alert("Error: ", json.due_date.toString())
          else Alert.alert("Fatal Error, contact dev because something is wrong")
        }
        else
        {
          Alert.alert("Task has been successfully created.")
          navigation.pop()
        }
      })
      .catch(exception => {
          console.log("Error occured", exception);
          // Do something when login fails
      })
    })

  }
  
  
  render() {
    const {navigation} = this.props;
    // const open = false

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={text => this.setState({ title: text })}
            value={this.state.title}
            placeholder="Title for Reminder"
            placeholderTextColor="rgba(168, 218, 220, 1)"
            textContentType="none"
          />
        </View>

        <View style={styles.calContainer}>
          <CalendarPicker
            scaleFactor={Dimensions.get('window').width}
            onDateChange={this.onDateChange}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.largeInput}
            onChangeText={text => this.setState({ description: text })}
            value={this.state.description}
            placeholder="Description"
            placeholderTextColor="rgba(168, 218, 220, 1)"
            textContentType="none"
            textAlignVertical="top"
            multiline={true}
          />
        </View>

        <SelectDropdown
          data={this.state.tags}
          defaultButtonText={"Select Tag"}
          onSelect={(selectedItem, index) => {
            this.setState({taskTag: selectedItem})
            console.log("new tag selected")
            console.log(this.state.taskTag.title)
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            // text represented after item is selected
            // if data array is an array of objects then return selectedItem.property to render after item is selected
            return selectedItem.title
          }}
          rowTextForSelection={(item, index) => {
            // text represented for each item in dropdown
            // if data array is an array of objects then return item.property to represent item in dropdown
            return item.title
          }}
          buttonStyle={styles.dropdown1BtnStyle}
          buttonTextStyle={styles.dropdown1BtnTxtStyle}
          renderDropdownIcon={() => {
            return (
              <FontAwesome name="chevron-down" color={"#444"} size={18} />
            );
          }}
          dropdownIconPosition={"right"}
          dropdownStyle={styles.dropdown1DropdownStyle}
          rowStyle={styles.dropdown1RowStyle}
          rowTextStyle={styles.dropdown1RowTxtStyle}
        />


        <TouchableOpacity
          style={styles.button}
          onPress={() => this.onSubmit()}
        >
          <Text style={styles.buttonText}> Submit </Text>
        </TouchableOpacity>

      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  dropdown1BtnStyle: {
    width: "60%",
    height: 50,
    backgroundColor: 'rgba(69, 120, 144, 1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  dropdown1BtnTxtStyle: { color: 'rgba(168, 218, 220, 1)', textAlign: "left" },
  dropdown1DropdownStyle: { backgroundColor: "#EFEFEF" },
  dropdown1RowStyle: {
    backgroundColor: "#EFEFEF",
    borderBottomColor: "#C5C5C5",
  },
  dropdown1RowTxtStyle: { color: "#444", textAlign: "left" },
  container: {
    flex: 1,
    backgroundColor: '#FAEBEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    width: "100%",
    justifyContent: 'center'
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    maxHeight: '30%',
    width: Dimensions.get('window').width,
    backgroundColor: "white"
    
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(69, 120, 144, 1)',
    marginHorizontal: 8,
    color: '#fff',
    borderRadius: 100,
    width: '45%',
    padding: 10,
  },
  buttonText: {
    color: 'rgba(168, 218, 220, 1)',
    fontWeight: 'bold'
  },
  loginText: {
    bottom: "10%",
    fontSize: 50,
    textAlign: "center",
    color: 'rgba(29, 53, 87, 1)',
    textShadowColor: 'rgba(29, 53, 87, 1)',
    textShadowOffset: {height: 2},
    textShadowRadius: 10
  },
  input: {
    height: 60,
    width: '90%',
    left: '5%',
    fontSize: 16,
    paddingStart: 40,
    paddingEnd: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    textAlign: 'left',
    borderRadius: 100,
    backgroundColor: 'rgba(69, 120, 144, 1)',
    color: 'white',
  },
  largeInput: {
    height: '40%',
    width: '90%',
    left: '5%',
    fontSize: 16,
    paddingStart: 40,
    paddingEnd: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    textAlign: 'left',
    paddingTop: '5%',
    marginBottom: '5%',
    borderRadius: 100,
    backgroundColor: 'rgba(69, 120, 144, 1)',
    color: 'white',
  },


  
});
