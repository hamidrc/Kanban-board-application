import { Button, Card, CardActions, CardContent, CardHeader, Modal } from '@material-ui/core';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import useStyles from './useStyles';
import Task from './Task';
import { Column as ColumnInterface } from '../../interface/Column';
import { Task as TaskInterface, TaskPlaceHolder } from '../../interface/Task';
import { useState } from 'react';
export interface properties {
  placeHolderStyle: TaskPlaceHolder;
  Column: ColumnInterface;
  index: number;
  Tasks: TaskInterface[];
  AddTask: (columnId: string) => void;
}

const Column: React.FunctionComponent<properties> = (props) => {
  const [state, setState] = useState({
    placeHolderStyle: props.placeHolderStyle,
    visible: -1,
    dragFinished: true,
    isModelOpen: false,
    //Tasks: props.Tasks,
    //TaskOrder: props.TaskOrder,
  });
  const classes = useStyles();
  const setVisable = (visible: number) => {
    setState({ ...state, visible });
  };
  const onMouseEnter = () => {
    const placeHolder = document.getElementById('placeholder-' + props.Column.Id);
    const column = document.getElementById(props.Column.Id);
    if (!placeHolder || !column) {
      return;
    }
    if (
      column.getBoundingClientRect().bottom <
      placeHolder.getBoundingClientRect().bottom + placeHolder.getBoundingClientRect().height * 0.5
    ) {
      setVisable(-1);
    } else {
      setVisable(1);
    }
  };
  const onMouseLeave = () => {
    setVisable(-1);
  };
  const onMouseUp = () => {
    setVisable(-1);
  };
  const addCard = () => {
    console.log('Add card');
    //const Tasks = state.Tasks;
    //const TaskOrder = state.TaskOrder;
    //const task: TaskInterface = { Name: 'new task', Date: '', Color: '#5ACD76', Id: 'task-4' };
    //Tasks.push(task);
    //TaskOrder.push('task-4');
    //setState({ ...state, Tasks, TaskOrder });
    props.AddTask(props.Column.Id);
  };

  const modelOpen = () => {
    const isModelOpen = true;
    setState({ ...state, isModelOpen });
  };
  const modelClose = () => {
    const isModelOpen = false;
    setState({ ...state, isModelOpen });
  };

  return (
    <>
      <Draggable draggableId={props.Column.Id} index={props.index}>
        {(provided) => (
          <Card
            className={classes.column}
            {...provided.draggableProps}
            ref={provided.innerRef}
            onMouseOver={() => onMouseEnter()}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            id={props.Column.Id}
          >
            <CardHeader
              title={props.Column.Title}
              titleTypographyProps={{ variant: 'h5' }}
              className={classes.columnTitle}
              {...provided.dragHandleProps}
            ></CardHeader>
            <Droppable droppableId={props.Column.Id} type="task">
              {(provided, snapshot) => (
                <CardContent ref={provided.innerRef} {...provided.droppableProps}>
                  {props.Tasks.map((task: TaskInterface, index: number) => (
                    <Task key={task.Id} task={task} index={index} quickSettingActive={false}></Task>
                  ))}
                  {provided.placeholder}
                  <div
                    style={{
                      top: props.placeHolderStyle.clientY,
                      height: props.placeHolderStyle.clientHeight,
                      width: props.placeHolderStyle.clientWidth,
                      position: 'absolute',
                      zIndex: state.visible,
                    }}
                    hidden={!snapshot.isDraggingOver}
                  >
                    <Card
                      elevation={0}
                      style={{
                        top: props.placeHolderStyle.clientY,
                        left: props.placeHolderStyle.clientX,
                        height: props.placeHolderStyle.clientHeight,
                        width: props.placeHolderStyle.clientWidth,
                        position: 'static',
                        zIndex: state.visible,
                        backgroundColor: '#E5ECFC',
                      }}
                      id={'placeholder-' + props.Column.Id}
                      hidden={!snapshot.isDraggingOver}
                    ></Card>
                  </div>
                </CardContent>
              )}
            </Droppable>
            <CardActions>
              <Button
                variant="contained"
                id={'button-' + props.Column.Id}
                style={{ marginLeft: 10, marginBottom: 10, zIndex: 2, backgroundColor: '#759CFC', color: 'white' }}
                onClick={addCard}
              >
                Add a card
              </Button>
            </CardActions>
          </Card>
        )}
      </Draggable>
      <Modal open={state.isModelOpen} onClose={modelClose}>
        <Card></Card>
      </Modal>
    </>
  );
};

export default Column;
