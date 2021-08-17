import React, { useState } from 'react';
import Column from './Column';
import { Column as ColumnInterface } from '../../interface/ColumnApi';
import { TaskPlaceHolder } from '../../interface/Task';
import { useAuthBoard } from '../../context/useAuthBoardContext';
import { Board as BoardInterface } from '../../interface/BoardApi';
import mockData from './MockData';
import { DragDropContext, DropResult, Droppable, DragUpdate } from 'react-beautiful-dnd';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import useStyles from './useStyles';
import { useEffect } from 'react';
import { Card as CardInterface, Cards } from '../../interface/CardApi';
import { moveCardToAnotherColumn, moveColumn } from '../../helpers/APICalls/board';
import { createCard } from '../../helpers/APICalls/cards';
const Board: React.FunctionComponent = () => {
  const { loggedInUserBoard: userBoard } = useAuthBoard();

  //const { board, updateBoardContext } = useContext(BoardContext);
  const taskPlaceHolder: TaskPlaceHolder = { clientHeight: 0, clientWidth: 0, clientX: 0, clientY: 0 };
  const classes = useStyles();
  const [state, setState] = useState({
    mockData: userBoard,
    taskPlaceHolder: taskPlaceHolder,
    modalOpen: false,
    newColumnTitle: '',
  });

  //BoardApi().then((data: any) => {
  //  newBoard._id = data.board._id;
  //  newBoard.columns = data.board.columns;
  //  newBoard.title = data.board.title;
  //});

  const onDragUpdate = (result: DragUpdate) => {
    const { draggableId } = result;

    console.log(draggableId);

    const dom = document.getElementsByClassName('taskClass-' + draggableId)[0];

    if (!dom) {
      return;
    }
    const parentElement = dom.parentElement;
    if (!parentElement) {
      return;
    }

    const children = dom.parentNode?.children;
    if (!children) {
      return;
    }

    // setup the placeholder task

    const clientY = dom.getBoundingClientRect().y;

    const { clientHeight, clientWidth } = dom;
    const taskPlaceHolder: TaskPlaceHolder = {
      clientWidth: clientWidth,
      clientHeight: clientHeight,
      clientY: clientY,
      clientX: dom.getBoundingClientRect().x,
    };
    const newState = { ...state, taskPlaceHolder };
    setState(newState);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) {
      return;
    }
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (type === 'column') {
      const newColumnOrder = state.mockData?.board.columns;
      if (newColumnOrder) {
        newColumnOrder.splice(source.index, 1);
        newColumnOrder.splice(destination.index, 0, draggableId);
        const mockData = state.mockData;
        if (mockData?.board.columns && mockData.board) {
          mockData.board.columns = newColumnOrder;
          moveColumn(mockData.board._id, source.index, destination.index, draggableId);
        }
      }
      return;
    } else {
      if (state.mockData && state.mockData.cards) {
        const start = state.mockData.columns[source.droppableId];

        const finish = state.mockData.columns[destination.droppableId];
        const startTasks = state.mockData.columns[start._id].cards;
        if (startTasks) {
          startTasks.splice(source.index, 1);
          if (start === finish) {
            startTasks.splice(destination.index, 0, draggableId);
            const newColumn: ColumnInterface = {
              ...start,
              cards: startTasks,
            };

            const newColumns = state.mockData.columns;
            newColumns[source.droppableId] = newColumn;

            const newState = {
              ...state,
              columns: newColumns,
            };
            setState(newState);
          } else {
            // Move to another column
            const finishTasks = state.mockData.columns[finish._id].cards;
            finishTasks.splice(destination.index, 0, draggableId);
            const destinationColumn: ColumnInterface = {
              ...finish,
              cards: finishTasks,
            };
            const sourceColumn: ColumnInterface = {
              ...start,
              cards: startTasks,
            };

            const newColumns = state.mockData.columns;
            newColumns[destination.droppableId] = destinationColumn;
            newColumns[source.droppableId] = sourceColumn;

            const newState = {
              ...state,
              columns: newColumns,
            };
            setState(newState);

            moveCardToAnotherColumn(
              sourceColumn._id,
              destinationColumn._id,
              sourceColumn.cards,
              destinationColumn.cards,
            );
          }
        }
      }
    }
  };

  const addTask = (columnId: string) => {
    //const taskId = 'task-' + (Object.keys(state.mockData.tasks).length + 1);
    //const mockData = state.mockData;
    //mockData.tasks = {
    //  ...mockData.tasks,
    //  [taskId]: { name: 'Add title...', date: '', color: '#ffffff', id: taskId, isNew: true },
    //};
    //mockData.columns[columnId].tasks.push(taskId);
    //setState({ ...state, mockData });
    createCard('Add title...', '', columnId).then((cardData) => {
      //const id = card.._id;
      const card: CardInterface = {
        _id: cardData.card._id,
        date: '',
        title: cardData.card.title,
        description: 'test',
        cardDetails: cardData.card.cardDetails,
      };
      const mockData = state.mockData;
      if (mockData) {
        mockData.cards = { ...mockData.cards, [card._id]: card };
        mockData.columns[columnId].cards.push(card._id);
        setState({ ...state, mockData: mockData });
      }
      //console.log('Id: ' + id);
    });
  };

  const newColumn = () => {
    setState({ ...state, modalOpen: true });
  };

  const modalClose = () => {
    setState({ ...state, modalOpen: false, newColumnTitle: '' });
  };

  const changeNewColumnTitle = (value: string) => {
    setState({ ...state, newColumnTitle: value });
  };
  const createNewColumn = () => {
    /*
    const mockData = state.mockData;
    const newColumnId = 'col-' + (mockData.columnOrder.length + 1);
    mockData.columns = {
      ...mockData.columns,
      [newColumnId]: { title: state.newColumnTitle, _id: newColumnId, tasks: [] },
    };
    mockData.columnOrder.push(newColumnId);
    setState({ ...state, newColumnTitle: '', mockData: mockData });
    */
  };

  const deleteColumn = (columnId: string) => {
    /*
    const mockData = state.mockData;
    mockData.columnOrder.splice(mockData.columnOrder.indexOf(columnId), 1);
    mockData.columns[columnId].tasks.forEach((task) => {
      delete mockData.tasks[columnId];
    });
    delete mockData.columns[columnId];
    setState({ ...state, mockData: mockData });
    */
  };

  const fillOutTasks = (columId: string) => {
    let tasks: Cards = {};
    state.mockData?.columns[columId].cards.map((taskId: string) => {
      const task = state.mockData?.cards[taskId];
      if (task !== undefined)
        tasks = {
          ...tasks,
          [task._id]: {
            _id: task._id,
            title: task.title,
            date: task.date,
            description: task.description,
            cardDetails: task.cardDetails,
          },
        };
    });
    return tasks;
  };
  if (state.mockData === undefined || state.mockData?.columns === undefined || state.mockData?.cards === undefined) {
    return <React.Fragment></React.Fragment>;
  } else {
    return (
      <React.Fragment>
        <Grid container direction="row" justify="flex-start" alignItems="stretch" alignContent="flex-start" spacing={0}>
          <Grid item xs={1} style={{ backgroundColor: 'grey', verticalAlign: 'center' }}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="100vh"
              fontSize="10vw"
              onClick={newColumn}
            >
              <AddCircleOutlineIcon style={{ fontSize: '120px', color: 'white' }}></AddCircleOutlineIcon>
            </Box>
          </Grid>
          <Grid item xs>
            <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
              <Droppable droppableId="board" direction="horizontal" type="column">
                {(provided) => (
                  <Grid container direction="row" justify="flex-start" ref={provided.innerRef}>
                    {state.mockData?.board.columns.map((Id, index) => (
                      <Column
                        Column={state.mockData?.columns[Id]}
                        key={Id}
                        Tasks={fillOutTasks(Id)}
                        index={index}
                        placeHolderStyle={state.taskPlaceHolder}
                        addTask={addTask}
                        taskDialog={newColumn}
                        delete={deleteColumn}
                      ></Column>
                    ))}
                    {provided.placeholder}
                  </Grid>
                )}
              </Droppable>
            </DragDropContext>
          </Grid>
        </Grid>
        <Modal
          open={state.modalOpen}
          onClose={modalClose}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Card className={classes.newColumnModal}>
            <CardHeader action={<CloseIcon onClick={modalClose}></CloseIcon>}></CardHeader>
            <CardContent>
              <Box display="flex" justifyContent="center" alignItems="center" className={classes.newColumnModalBox}>
                <div>
                  <Typography variant="h6" component="div">
                    <Box fontWeight={600} fontSize={20}>
                      Create a new column
                    </Box>
                  </Typography>
                </div>
              </Box>
              <Box display="flex" justifyContent="center" alignItems="center" className={classes.newColumnModalBox}>
                <TextField
                  id="newColumn"
                  variant="outlined"
                  onChange={(event) => {
                    changeNewColumnTitle(event.target.value);
                  }}
                  placeholder="Add Title"
                  inputProps={{ style: { textAlign: 'center', color: 'black' } }}
                />
              </Box>
            </CardContent>
            <CardActions>
              <Box display="flex" justifyContent="center" alignItems="center" className={classes.newColumnModalBox}>
                <Button color="primary" variant="contained" onClick={createNewColumn}>
                  Create
                </Button>
              </Box>
            </CardActions>
          </Card>
        </Modal>
      </React.Fragment>
    );
  }
};

export default Board;
