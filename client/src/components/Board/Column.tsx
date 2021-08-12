import { Button, Card, CardActions, CardContent, CardHeader, Input, Modal } from '@material-ui/core';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import useStyles from './useStyles';
import Task from './Task';
import { Column as ColumnInterface } from '../../interface/Column';
import { Task as TaskInterface, TaskPlaceHolder } from '../../interface/Task';
import { useState } from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
export interface properties {
  placeHolderStyle: TaskPlaceHolder;
  Column: ColumnInterface;
  index: number;
  Tasks: TaskInterface[];
  addTask: (columnId: string) => void;
  delete: (columnId: string) => void;
  taskDialog: (taskId: string) => void;
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
    const placeHolder = document.getElementById('placeholder-' + props.Column.id);
    const column = document.getElementById(props.Column.id);
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
    props.addTask(props.Column.id);
  };

  const modelClose = () => {
    const isModelOpen = false;
    setState({ ...state, isModelOpen });
  };

  const deleteColumn = () => {
    props.delete(props.Column.id);
  };

  return (
    <>
      <Draggable draggableId={props.Column.id} index={props.index}>
        {(provided) => (
          <Card
            className={classes.column}
            {...provided.draggableProps}
            ref={provided.innerRef}
            onMouseOver={() => onMouseEnter()}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            id={props.Column.id}
          >
            <CardHeader
              title={<ColumnTitle Column={props.Column}></ColumnTitle>}
              titleTypographyProps={{ variant: 'h5' }}
              className={classes.columnTitle}
              {...provided.dragHandleProps}
              action={<DeleteIcon className={classes.deleteIcon} onClick={deleteColumn}></DeleteIcon>}
            ></CardHeader>
            <Droppable droppableId={props.Column.id} type="task">
              {(provided, snapshot) => (
                <CardContent ref={provided.innerRef} {...provided.droppableProps}>
                  {props.Tasks.map((task: TaskInterface, index: number) => (
                    <Task key={task.id} task={task} index={index} isNew={task.isNew}></Task>
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
                      id={'placeholder-' + props.Column.id}
                      hidden={!snapshot.isDraggingOver}
                    ></Card>
                  </div>
                </CardContent>
              )}
            </Droppable>
            <CardActions>
              <Button
                variant="contained"
                id={'button-' + props.Column.id}
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
interface titleProperties {
  Column: ColumnInterface;
}
const ColumnTitle: React.FunctionComponent<titleProperties> = (props) => {
  const [state, setState] = useState({
    editing: false,
    Column: props.Column,
    editValue: props.Column.title,
  });

  const doubleClick = () => {
    setState({ ...state, editing: true });
  };
  const change = (value: string) => {
    setState({ ...state, editValue: value });
  };
  const handleEnter = (key: string) => {
    if (key === 'Enter') {
      const Column = state.Column;
      Column.title = state.editValue;
      setState({ ...state, editing: false, Column: Column });
    }
  };
  if (state.editing) {
    return (
      <Input
        defaultValue={state.Column.title}
        onChange={(event) => {
          change(event.target.value);
        }}
        onKeyPress={(event) => {
          handleEnter(event.key);
        }}
      ></Input>
    );
  } else {
    return <span onDoubleClick={doubleClick}>{state.Column.title}</span>;
  }
};
