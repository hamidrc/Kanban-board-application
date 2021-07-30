import { useState, useEffect } from 'react';
import Column from './Column';
import { TaskPlaceHolder } from '../../interface/Task';
import mockData from './MockData';
import { DragDropContext, DropResult, Droppable, DragUpdate } from 'react-beautiful-dnd';
import { Grid } from '@material-ui/core';
const Board = () => {
  const taskPlaceHolder: TaskPlaceHolder = { clientHeight: 0, clientWidth: 0, clientX: 0, clientY: 0 };

  const [state, setState] = useState({
    mockData: mockData,
    taskPlaceHolder: taskPlaceHolder,
  });
  useEffect(() => {
    console.log('dragging');
  });
  const onDragUpdate = (result: DragUpdate) => {
    const { draggableId, type, source } = result;

    console.log(draggableId);
    // if (type !== 'column') {
    ///  //const dom = document.querySelector(`[${'data-rbd-draggable-id'}='${draggableId}']`);
    const dom = document.getElementsByClassName('taskClass-' + draggableId)[0];

    if (!dom) {
      return;
    }
    const parentElement = dom.parentElement;
    if (!parentElement) {
      return;
    }
    console.log(dom);

    const children = dom.parentNode?.children;
    if (!children) {
      return;
    }

    // setup the placeholder task

    //const clientY =
    //  parseFloat(window.getComputedStyle(parentElement).paddingTop) +
    //  [...children].slice(0, destination.index).reduce((total, current) => {
    //    const style = window.getComputedStyle(current);
    //    const marginBottom = parseFloat(style.marginBottom);
    //    return total + current.clientHeight + marginBottom;
    //  }, 0);
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
    console.log(newState.taskPlaceHolder);
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
      console.log('moved column');
      const newColumnOrder = Array.from(state.mockData.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);
      const mockData = state.mockData;
      mockData.columnOrder = newColumnOrder;
      setState({ ...state, mockData });

      return;
    } else {
      const start = state.mockData.columns[source.droppableId];
      const dom = document.getElementsByClassName('taslClass-' + source.droppableId)[0];
      if (!dom) {
        return;
      }
      // setup the placeholder task
      const { clientHeight, clientWidth } = dom;
      const taskPlaceHolder: TaskPlaceHolder = {
        clientWidth: clientWidth,
        clientHeight: clientHeight,
        clientY: dom.getBoundingClientRect().y,
        clientX: dom.getBoundingClientRect().left,
      };

      setState({ ...state, taskPlaceHolder });

      const finish = state.mockData.columns[destination.droppableId];
      const startTasks = Array.from(start.Tasks);
      startTasks.splice(source.index, 1);
      if (start === finish) {
        startTasks.splice(destination.index, 0, draggableId);
        const newColumn: any = {
          ...start,
          Tasks: startTasks,
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
        const finishTasks = Array.from(finish.Tasks);
        finishTasks.splice(destination.index, 0, draggableId);
        const destinationColumn: any = {
          ...finish,
          Tasks: finishTasks,
        };
        const sourceColumn: any = {
          ...start,
          Tasks: startTasks,
        };

        const newColumns = state.mockData.columns;
        newColumns[destination.droppableId] = destinationColumn;
        newColumns[source.droppableId] = sourceColumn;

        const newState = {
          ...state,
          columns: newColumns,
        };
        setState(newState);
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
      <Droppable droppableId="board" direction="horizontal" type="column">
        {(provided) => (
          <Grid container direction="row" justify="center" ref={provided.innerRef}>
            {state.mockData.columnOrder.map((Id, index) => (
              <Column
                Column={state.mockData.columns[Id]}
                key={Id}
                Tasks={state.mockData.columns[Id].Tasks.map((task: string) => state.mockData.tasks[task])}
                index={index}
                placeHolderStyle={state.taskPlaceHolder}
              ></Column>
            ))}
            {provided.placeholder}
          </Grid>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Board;
